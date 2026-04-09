import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RoCard } from '../components/RoCard';
import { SectionCard } from '../components/SectionCard';
import { StatusPill } from '../components/StatusPill';
import { useMonitoring } from '../context/MonitoringContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { AlertSeverity } from '../types/monitoring';
import { assessRo } from '../utils/monitoring';

type Props = NativeStackScreenProps<AppStackParamList, 'Floor'>;

export function FloorScreen({ route, navigation }: Props) {
  const { hostelId, floorNumber } = route.params;
  const { getHostelById, getFloor } = useMonitoring();
  const hostel = getHostelById(hostelId);
  const floor = getFloor(hostelId, floorNumber);

  const summary = useMemo(() => {
    if (!floor) {
      return null;
    }

    const assessments = floor.ro_list.map(assessRo);
    const critical = assessments.filter((item) => item.status === 'critical').length;
    const warning = assessments.filter((item) => item.status === 'warning').length;
    const status: AlertSeverity = critical > 0 ? 'critical' : warning > 0 ? 'warning' : 'safe';

    return { critical, warning, status };
  }, [floor]);

  if (!hostel || !floor || !summary) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Floor not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionCard>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{hostel.name}</Text>
            <Text style={styles.meta}>Floor {floorNumber}</Text>
          </View>
          <StatusPill status={summary.status} />
        </View>
        <Text style={styles.summary}>{summary.critical} critical · {summary.warning} warning</Text>
      </SectionCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ROs on this floor</Text>
        {/* <Text style={styles.sectionMeta}>Graphs open in detail view</Text> */}
      </View>

      <View style={styles.grid}>
        {floor.ro_list.map((ro) => (
          <RoCard key={ro.id} ro={ro} compact onPress={() => navigation.navigate('RoDetail', { roId: ro.id })} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: '#eff5ff',
    fontSize: 22,
    fontWeight: '900',
  },
  meta: {
    color: '#8fa3b5',
    marginTop: 4,
    fontWeight: '700',
  },
  summary: {
    color: '#b8c8d6',
    marginTop: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#eef5ff',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#7d90a3',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
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