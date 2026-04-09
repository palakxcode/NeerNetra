import { CampusUnit, HostelUnit, ParameterThresholds, QualityParameters, RoUnit } from '../types/monitoring';

const thresholdTemplate: ParameterThresholds = {
  tds: { min: 100, max: 250 },
  turbidity: { min: 0, max: 1 },
  ph: { min: 6.5, max: 8.5 },
  chlorine: { min: 0.2, max: 0.8 },
  hardness: { min: 60, max: 180 },
  conductivity: { min: 150, max: 500 },
  iron: { min: 0, max: 0.3 },
  fluoride: { min: 0.5, max: 1.5 },
  nitrate: { min: 0, max: 45 },
  temperature: { min: 18, max: 32 },
  calcium: { min: 40, max: 120 },
};

const createParameters = (seed: number): QualityParameters => ({
  tds: 165 + seed * 3,
  turbidity: 0.35 + seed * 0.02,
  ph: 7.1 + seed * 0.03,
  chlorine: 0.45 + seed * 0.01,
  hardness: 112 + seed * 2,
  conductivity: 285 + seed * 5,
  iron: 0.08 + seed * 0.01,
  fluoride: 0.9 + seed * 0.02,
  nitrate: 14 + seed,
  temperature: 24 + seed * 0.3,
  calcium: 82 + seed * 2,
});

const buildRo = (hostelId: string, hostelName: string, floorNumber: number, roNumber: 1 | 2, seed: number): RoUnit => ({
  id: `${hostelId}-F${String(floorNumber).padStart(2, '0')}-RO${roNumber}`,
  hostel_id: hostelId,
  hostel_name: hostelName,
  floor_number: floorNumber,
  ro_number: roNumber,
  parameters: createParameters(seed),
  parameter_thresholds: thresholdTemplate,
  alerts: [],
  monkey_detected: false,
  last_updated: new Date().toISOString(),
  history: [],
});

const buildHostel = (id: string, name: string, floorCount: number, seedOffset: number): HostelUnit => ({
  id,
  name,
  floors: Array.from({ length: floorCount }, (_, index) => {
    const floorNumber = index + 1;
    return {
      floor_number: floorNumber,
      ro_list: [
        buildRo(id, name, floorNumber, 1, seedOffset + index * 2),
        buildRo(id, name, floorNumber, 2, seedOffset + index * 2 + 1),
      ],
    };
  }),
});

export const buildCampus = (): CampusUnit => ({
  hostels: [
    buildHostel('H1', 'A Block', 15, 1),
    buildHostel('H2', 'B Block', 15, 2),
    buildHostel('H3', 'D1 Block', 15, 3),
    buildHostel('H4', 'D2 Block', 16, 4),
    buildHostel('H5', 'C Block', 16, 5),
    buildHostel('H6', 'E Block', 16, 6),
  ],
});