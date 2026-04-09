import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { query, where, collection, onSnapshot, getFirestore } from 'firebase/firestore';

import { SectionCard } from '../components/SectionCard';
import { StatusPill } from '../components/StatusPill';
import { firebaseApp } from '../firebase/config';
import { AppStackParamList } from '../navigation/AppNavigator';
import { RoUnit } from '../types/monitoring';
import { assessRo } from '../utils/monitoring';

type Props = NativeStackScreenProps<AppStackParamList, 'RoDetail'>;

const parameters = [
  { label: 'Sulfate', value: 'Sulfate' },
  { label: 'Solids', value: 'Solids' },
  { label: 'Potability', value: 'Potability' },
  { label: 'Organic_carbon', value: 'organic_carbon' },
  { label: 'Hardness', value: 'hardness' },
  { label: 'Chloramines', value: 'chloramines' },
  { label: 'Conductivity', value: 'conductivity' },
  { label: 'Trihalomethanes', value: 'trihalomethanes' },
  { label: 'Turbidity', value: 'turbidity' },
  { label: 'ph', value: 'ph' },
] as const;

type FirestoreRoData = {
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
  hostel?: string;
  floor?: number;
  ro?: number;
};

const parameterToRoKey: Record<(typeof parameters)[number]['value'], keyof RoUnit['parameters']> = {
  Sulfate: 'fluoride',
  Solids: 'tds',
  Potability: 'nitrate',
  organic_carbon: 'temperature',
  hardness: 'hardness',
  chloramines: 'chlorine',
  conductivity: 'conductivity',
  trihalomethanes: 'iron',
  turbidity: 'turbidity',
  ph: 'ph',
};

const defaultRoState = (roId: string): RoUnit => ({
  id: roId,
  hostel_id: 'hostelA',
  hostel_name: 'A Block',
  floor_number: 1,
  ro_number: 1,
  parameters: {
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
  },
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

export function RoDetailScreen({ route }: Props) {
  const { roId } = route.params;
  const [ro, setRo] = useState<RoUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [parameterKey, setParameterKey] = useState<(typeof parameters)[number]['value']>('Solids');

  useEffect(() => {
    const firestore = getFirestore(firebaseApp);
    const roQuery = query(
      collection(firestore, 'water_data'),
      where('hostel', '==', 'A'),
      where('floor', '==', 1),
      where('ro', '==', 1)
    );

    const unsubscribe = onSnapshot(
      roQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setRo(null);
          setLoading(false);
          return;
        }

        const docSnapshot = snapshot.docs[0];
        const data = docSnapshot.data() as FirestoreRoData | undefined;

        if (!data) {
          setRo(null);
          setLoading(false);
          return;
        }

        const base = defaultRoState(roId);
        const nextParameters = {
          ...base.parameters,
          tds: typeof data?.Solids === 'number' ? data.Solids : base.parameters.tds,
          turbidity: typeof data?.Turbidity === 'number' ? data.Turbidity : base.parameters.turbidity,
          ph: typeof data?.ph === 'number' ? data.ph : base.parameters.ph,
          chlorine: typeof data?.Chloramines === 'number' ? data.Chloramines : base.parameters.chlorine,
          hardness: typeof data?.Hardness === 'number' ? data.Hardness : base.parameters.hardness,
          conductivity: typeof data?.Conductivity === 'number' ? data.Conductivity : base.parameters.conductivity,
          iron: typeof data?.Trihalomethanes === 'number' ? data.Trihalomethanes : base.parameters.iron,
          fluoride: typeof data?.Sulfate === 'number' ? data.Sulfate : base.parameters.fluoride,
          nitrate: typeof data?.Potability === 'number' ? data.Potability : base.parameters.nitrate,
          temperature: typeof data?.Organic_carbon === 'number' ? data.Organic_carbon : base.parameters.temperature,
        };

        setRo({
          ...base,
          hostel_name: data?.hostel ? `${data.hostel} Block` : base.hostel_name,
          floor_number: typeof data?.floor === 'number' ? data.floor : base.floor_number,
          ro_number: data?.ro === 2 ? 2 : 1,
          parameters: nextParameters,
        });
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore listener error:', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roId]);

  const assessment = useMemo(() => (ro ? assessRo(ro) : null), [ro]);

  const selectedParameter = parameterToRoKey[parameterKey];

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Loading RO data...</Text>
      </View>
    );
  }

  if (!ro || !assessment) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>RO not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionCard>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{ro.id}</Text>
            <Text style={styles.meta}>{ro.hostel_name} · Floor {ro.floor_number} · RO {ro.ro_number}</Text>
          </View>
          <StatusPill status={assessment.status} />
        </View>
        {/* <Text style={styles.summary}>Causes: {assessment.causes.length ? assessment.causes.join(', ') : 'None'}</Text> */}
      </SectionCard>

      <SectionCard>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Quality Parameters</Text>
          <Text style={styles.sectionMeta}>Select a parameter to view</Text>
        </View>
        <View style={styles.toggleRow}>
          {parameters.map((parameter) => {
            const active = parameter.value === parameterKey;
            return (
              <Pressable key={parameter.value} onPress={() => setParameterKey(parameter.value)} style={[styles.toggle, active && styles.toggleActive]}>
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{parameter.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.summary}>Current value: {ro.parameters[selectedParameter]?.toFixed(2)}</Text>
      </SectionCard>

      {/* <SectionCard>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <View style={styles.alertList}>
          {assessment.alerts.length > 0 ? (
            assessment.alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertItem, alert.type === 'monkey' && styles.monkeyAlert]}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertMeta}>{alert.severity?.toUpperCase()} · {alert.type?.replace('_', ' ')}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No active alerts</Text>
          )}
        </View>
      </SectionCard> */}

      {/* <SectionCard>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.summary}>Current state: {assessment.status.toUpperCase()}</Text>
        <Text style={styles.summary}>Highest priority issue is listed first.</Text>
        <Text style={styles.summary}>Magnitude report: {assessment.deviation_report.length ? assessment.deviation_report.map((item) => `${item.parameter} +${item.deviation}`).join(' · ') : 'Within range'}</Text>
      </SectionCard> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: '#f0f7ff',
    fontSize: 22,
    fontWeight: '900',
  },
  meta: {
    color: '#8fa3b5',
    marginTop: 4,
    fontWeight: '600',
  },
  summary: {
    color: '#b8c8d6',
    marginTop: 8,
    fontWeight: '700',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#eff6ff',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#7d90a3',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0e1926',
    borderWidth: 1,
    borderColor: '#223649',
  },
  toggleActive: {
    backgroundColor: '#17394a',
    borderColor: '#4dd0e1',
  },
  toggleText: {
    color: '#a8bccd',
    fontSize: 11,
    fontWeight: '800',
  },
  toggleTextActive: {
    color: '#e6fdff',
  },
  alertList: {
    gap: 10,
    marginTop: 12,
  },
  alertItem: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#2a2330',
    borderWidth: 1,
    borderColor: '#46324c',
    gap: 6,
  },
  monkeyAlert: {
    backgroundColor: '#3a0f18',
    borderColor: '#ff5b73',
  },
  alertMessage: {
    color: '#f3f8ff',
    fontWeight: '800',
  },
  alertMeta: {
    color: '#c3d1df',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  noData: {
    color: '#8da0b3',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#f3b6c1',
  },
});