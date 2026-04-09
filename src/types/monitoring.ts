export type QualityParameters = {
  tds: number;
  turbidity: number;
  ph: number;
  chlorine: number;
  hardness: number;
  conductivity: number;
  iron: number;
  fluoride: number;
  nitrate: number;
  temperature: number;
  calcium: number;
};

export type ParameterThresholds = {
  [K in keyof QualityParameters]: { min: number; max: number };
};

export type AlertType = 'monkey' | 'quality';

export type AlertSeverity = 'safe' | 'warning' | 'critical';

export type Alert = {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  priority: number;
  created_at: string;
  causes?: string[];
};

export type RoSample = {
  timestamp: string;
  parameters: QualityParameters;
  monkey_detected: boolean;
};

export type RoUnit = {
  id: string;
  hostel_id: string;
  hostel_name: string;
  floor_number: number;
  ro_number: 1 | 2;
  parameters: QualityParameters;
  parameter_thresholds: ParameterThresholds;
  alerts: Alert[];
  monkey_detected: boolean;
  last_updated: string;
  history: RoSample[];
};

export type FloorUnit = {
  floor_number: number;
  ro_list: RoUnit[];
};

export type HostelUnit = {
  id: string;
  name: string;
  floors: FloorUnit[];
};

export type CampusUnit = {
  hostels: HostelUnit[];
};

export type RoAssessment = {
  status: AlertSeverity;
  causes: string[];
  alerts: Alert[];
  parameter_status: AlertSeverity;
  deviation_report: Array<{ parameter: string; deviation: number; value: number; min: number; max: number }>;
};

export type FilterState = {
  query: string;
  unsafeOnly: boolean;
  monkeyOnly: boolean;
};