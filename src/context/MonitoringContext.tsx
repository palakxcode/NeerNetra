import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';

import { firebaseApp } from '../firebase/config';
import { assessRo } from '../utils/monitoring';
import { CampusUnit, RoUnit, QualityParameters } from '../types/monitoring';

type MonitoringContextValue = {
  campus: CampusUnit;
  lastRefresh: string;
  refreshNow: () => void;
  getHostelById: (id: string) => any;
  getFloor: (hostelId: string, floorNumber: number) => any;
  getRo: (roId: string) => RoUnit | undefined;
};

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

type FirestoreRoData = {
  hostel?: string;
  floor?: number;
  ro?: number;
  Sulfate?: number;
  Solids?: number;
  Potability?: number;
  Organic_carbon?: number;
  Hardness?: number;
  Chloramines?: number;
  Conductivity?: number;
  Trihalomethanes?: number;
  Turbidity?: number;
  ph?: number;
};

const defaultParameters = (): QualityParameters => ({
  tds: 0,
  turbidity: 0,
  ph: 7,
  chlorine: 0,
  hardness: 0,
  conductivity: 0,
  iron: 0,
  fluoride: 0,
  nitrate: 0,
  temperature: 25,
  calcium: 0,
});

const defaultRoUnit = (id: string, hostelName: string, hostelId: string, floorNumber: number, roNumber: 1 | 2): RoUnit => ({
  id,
  hostel_id: hostelId,
  hostel_name: hostelName,
  floor_number: floorNumber,
  ro_number: roNumber,
  parameters: defaultParameters(),
  parameter_thresholds: {
    tds: { min: 50, max: 300 },
    turbidity: { min: 0, max: 1 },
    ph: { min: 6.5, max: 8.5 },
    chlorine: { min: 0.2, max: 1.2 },
    hardness: { min: 40, max: 180 },
    conductivity: { min: 100, max: 500 },
    iron: { min: 0, max: 0.3 },
    fluoride: { min: 0.2, max: 1.5 },
    nitrate: { min: 0, max: 45 },
    temperature: { min: 18, max: 32 },
    calcium: { min: 20, max: 100 },
  },
  alerts: [],
  monkey_detected: false,
  last_updated: new Date().toISOString(),
  history: [],
});

const mapFirestoreToRoUnit = (
  data: FirestoreRoData,
  id: string,
  hostelName: string,
  hostelId: string,
  floorNumber: number,
  roNumber: 1 | 2
): RoUnit => {
  const base = defaultRoUnit(id, hostelName, hostelId, floorNumber, roNumber);

  const parameters: QualityParameters = {
    ...base.parameters,
    tds: typeof data.Solids === 'number' ? data.Solids : base.parameters.tds,
    turbidity: typeof data.Turbidity === 'number' ? data.Turbidity : base.parameters.turbidity,
    ph: typeof data.ph === 'number' ? data.ph : base.parameters.ph,
    chlorine: typeof data.Chloramines === 'number' ? data.Chloramines : base.parameters.chlorine,
    hardness: typeof data.Hardness === 'number' ? data.Hardness : base.parameters.hardness,
    conductivity: typeof data.Conductivity === 'number' ? data.Conductivity : base.parameters.conductivity,
    iron: typeof data.Trihalomethanes === 'number' ? data.Trihalomethanes : base.parameters.iron,
    fluoride: typeof data.Sulfate === 'number' ? data.Sulfate : base.parameters.fluoride,
    nitrate: typeof data.Potability === 'number' ? data.Potability : base.parameters.nitrate,
    temperature: typeof data.Organic_carbon === 'number' ? data.Organic_carbon : base.parameters.temperature,
  };

  return {
    ...base,
    parameters,
  };
};

const buildMinimalCampus = (firestoreRoData: FirestoreRoData | null): CampusUnit => {
  const baseRo1 = defaultRoUnit('hostelA_floor1_ro1', 'A Block', 'hostelA', 1, 1);

  const ro1 = firestoreRoData ? mapFirestoreToRoUnit(firestoreRoData, 'hostelA_floor1_ro1', 'A Block', 'hostelA', 1, 1) : baseRo1;
  const assessment1 = assessRo(ro1);
  ro1.alerts = assessment1.alerts;

  return {
    hostels: [
      {
        id: 'hostelA',
        name: 'A Block',
        floors: [
          {
            floor_number: 1,
            ro_list: [ro1],
          },
        ],
      },
    ],
  };
};

export function MonitoringProvider({ children }: PropsWithChildren) {
  const [firestoreRoData, setFirestoreRoData] = useState<FirestoreRoData | null>(null);
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toISOString());

  useEffect(() => {
    const firestore = getFirestore(firebaseApp);
    const waterDataRef = collection(firestore, 'water_data');

    const unsubscribe = onSnapshot(
      waterDataRef,
      (snapshot) => {
        const docs = snapshot.docs.filter((doc) => {
          const data = doc.data() as FirestoreRoData;
          return data.hostel === 'A' && data.floor === 1 && data.ro === 1;
        });

        if (docs.length > 0) {
          setFirestoreRoData(docs[0].data() as FirestoreRoData);
        } else {
          setFirestoreRoData(null);
        }

        setLastRefresh(new Date().toISOString());
      },
      (error) => {
        console.warn('Firestore listener error:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const campus = useMemo(() => buildMinimalCampus(firestoreRoData), [firestoreRoData]);

  const refreshNow = () => {
    setLastRefresh(new Date().toISOString());
  };

  const value = useMemo<MonitoringContextValue>(() => {
    const getHostelById = (id: string) => campus.hostels.find((hostel) => hostel.id === id);

    const getFloor = (hostelId: string, floorNumber: number) =>
      campus.hostels.find((hostel) => hostel.id === hostelId)?.floors.find((floor) => floor.floor_number === floorNumber);

    const getRo = (roId: string) => {
      for (const hostel of campus.hostels) {
        for (const floor of hostel.floors) {
          const match = floor.ro_list.find((ro) => ro.id === roId);
          if (match) {
            return match;
          }
        }
      }

      return undefined;
    };

    return {
      campus,
      lastRefresh,
      refreshNow,
      getHostelById,
      getFloor,
      getRo,
    };
  }, [campus, lastRefresh]);

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);

  if (!context) {
    throw new Error('useMonitoring must be used within MonitoringProvider');
  }

  return context;
};
