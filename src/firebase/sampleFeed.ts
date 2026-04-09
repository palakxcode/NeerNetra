import { getDatabase, onValue, ref } from 'firebase/database';

import { QualityParameters } from '../types/monitoring';
import { firebaseApp } from './config';

export type FirebaseRoSample = {
  monkey_detected?: boolean;
  parameters?: Partial<QualityParameters>;
};

export type FirebaseSampleSelection = {
  sampleKey: string;
  hostelName: string;
  floorNumber: number;
  ro1?: FirebaseRoSample;
  ro2?: FirebaseRoSample;
  shared?: FirebaseRoSample;
};

const CONTROL_PATH = 'demoControl';
const DEFAULT_HOSTEL_NAME = 'A Block';
const DEFAULT_FLOOR_NUMBER = 1;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return undefined;
};

const parseParameters = (raw: unknown): Partial<QualityParameters> | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const source = raw as Record<string, unknown>;
  const parsed: Partial<QualityParameters> = {};
  const parameterKeys: Array<keyof QualityParameters> = [
    'tds',
    'turbidity',
    'ph',
    'chlorine',
    'hardness',
    'conductivity',
    'iron',
    'fluoride',
    'nitrate',
    'temperature',
    'calcium',
  ];

  parameterKeys.forEach((key) => {
    const value = toNumber(source[key]);
    if (value !== undefined) {
      parsed[key] = value;
    }
  });

  return Object.keys(parsed).length > 0 ? parsed : undefined;
};

const parseRoSample = (raw: unknown): FirebaseRoSample | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const source = raw as Record<string, unknown>;
  const monkeyDetected = toBoolean(source.monkey_detected ?? source.monkeyDetected);
  const parameters = parseParameters(source.parameters ?? source);

  if (monkeyDetected === undefined && !parameters) {
    return undefined;
  }

  return {
    monkey_detected: monkeyDetected,
    parameters,
  };
};

const resolveSelectedPayload = (raw: Record<string, unknown>): { sampleKey: string; payload: unknown } | undefined => {
  const selectedRaw = raw.selectedSample ?? raw.currentSample ?? raw.sampleNumber ?? raw.sample;
  const selected = selectedRaw !== undefined && selectedRaw !== null ? String(selectedRaw) : '';

  if (selected) {
    const samples = raw.samples as Record<string, unknown> | undefined;
    if (samples && typeof samples === 'object' && samples[selected] !== undefined) {
      return { sampleKey: selected, payload: samples[selected] };
    }

    const keyedPayload = raw[`sample${selected}`];
    if (keyedPayload !== undefined) {
      return { sampleKey: selected, payload: keyedPayload };
    }
  }

  if (raw.parameters || raw.ro1 || raw.ro2) {
    return { sampleKey: selected || 'direct', payload: raw };
  }

  return undefined;
};

export const parseFirebaseSelection = (raw: unknown): FirebaseSampleSelection | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const source = raw as Record<string, unknown>;
  const selection = resolveSelectedPayload(source);

  if (!selection) {
    return undefined;
  }

  const payload = selection.payload as Record<string, unknown>;
  const ro1 = parseRoSample(payload.ro1);
  const ro2 = parseRoSample(payload.ro2);
  const shared = parseRoSample(payload);

  if (!ro1 && !ro2 && !shared) {
    return undefined;
  }

  const floorNumber = toNumber(payload.floorNumber ?? payload.floor ?? payload.floor_number) ?? DEFAULT_FLOOR_NUMBER;
  const hostelName =
    (typeof payload.hostelName === 'string' && payload.hostelName) ||
    (typeof payload.hostel === 'string' && payload.hostel) ||
    DEFAULT_HOSTEL_NAME;

  return {
    sampleKey: selection.sampleKey,
    hostelName,
    floorNumber,
    ro1,
    ro2,
    shared,
  };
};

export const subscribeToFirebaseSample = (
  onSample: (sample: FirebaseSampleSelection) => void,
  onError?: (error: Error) => void
) => {
  const db = getDatabase(firebaseApp);
  const controlRef = ref(db, CONTROL_PATH);

  return onValue(
    controlRef,
    (snapshot) => {
      const parsed = parseFirebaseSelection(snapshot.val());
      if (parsed) {
        onSample(parsed);
      }
    },
    onError
  );
};
