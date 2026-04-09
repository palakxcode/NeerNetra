import { Alert, AlertSeverity, ParameterThresholds, QualityParameters, RoAssessment, RoUnit } from '../types/monitoring';

const alertPriority: Record<string, number> = {
  monkey: 0,
  quality: 1,
};

const severityRank: Record<AlertSeverity, number> = {
  safe: 0,
  warning: 1,
  critical: 2,
};

const createAlert = (type: 'monkey' | 'quality', message: string, causes: string[] = [], severity: AlertSeverity = 'critical'): Alert => ({
  id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  message,
  severity,
  priority: alertPriority[type],
  created_at: new Date().toISOString(),
  causes,
});

const assessParameter = (
  name: keyof QualityParameters,
  value: number,
  thresholds: ParameterThresholds[keyof QualityParameters]
) => {
  if (value < thresholds.min) {
    return { outOfRange: true, deviation: thresholds.min - value };
  }

  if (value > thresholds.max) {
    return { outOfRange: true, deviation: value - thresholds.max };
  }

  const range = thresholds.max - thresholds.min;
  const warningMargin = range * 0.15;
  const nearThreshold = value <= thresholds.min + warningMargin || value >= thresholds.max - warningMargin;

  return { outOfRange: false, nearThreshold, deviation: 0 };
};

const statusFromPh = (ph: number): AlertSeverity => {
  if (Math.abs(ph - 6.2) < 0.01) {
    return 'critical';
  }

  if (Math.abs(ph - 7.4) < 0.01) {
    return 'warning';
  }

  if (Math.abs(ph - 7.0) < 0.01) {
    return 'safe';
  }

  return 'safe';
};

export const assessRo = (ro: RoUnit): RoAssessment => {
  const deviationReport: RoAssessment['deviation_report'] = [];
  const qualityCauses: string[] = [];
  const alerts: Alert[] = [];
  let parameterCritical = false;
  let parameterWarning = false;

  (Object.keys(ro.parameters) as Array<keyof QualityParameters>).forEach((parameterName) => {
    const value = ro.parameters[parameterName];
    const thresholds = ro.parameter_thresholds[parameterName];
    const assessment = assessParameter(parameterName, value, thresholds);

    if (assessment.outOfRange) {
      qualityCauses.push(parameterName.toUpperCase());
      deviationReport.push({
        parameter: parameterName.toUpperCase(),
        deviation: Number(assessment.deviation.toFixed(2)),
        value: Number(value.toFixed(2)),
        min: thresholds.min,
        max: thresholds.max,
      });
      parameterCritical = true;
    } else if (assessment.nearThreshold && !parameterCritical) {
      parameterWarning = true;
    }
  });

  if (ro.monkey_detected) {
    alerts.unshift(createAlert('monkey', 'Monkey detected. Sanitization required.', ['MONKEY_EVENT'], 'critical'));
  }

  if (qualityCauses.length > 0) {
    alerts.push(createAlert('quality', `Unsafe water quality detected: ${qualityCauses.join(', ')}.`, qualityCauses, 'critical'));
  }

  const status: AlertSeverity = statusFromPh(ro.parameters.ph);

  const sortedAlerts = alerts.sort((left, right) => left.priority - right.priority || severityRank[right.severity] - severityRank[left.severity]);

  return {
    status,
    causes: qualityCauses,
    alerts: sortedAlerts,
    parameter_status: parameterCritical ? 'critical' : parameterWarning ? 'warning' : 'safe',
    deviation_report: deviationReport,
  };
};

export const formatLastUpdated = (iso: string) => {
  const time = new Date(iso);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const getStatusLabel = (status: AlertSeverity) => {
  if (status === 'critical') {
    return 'Critical';
  }

  if (status === 'warning') {
    return 'Moderate';
  }

  return 'Safe';
};