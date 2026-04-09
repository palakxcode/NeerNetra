import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FloorCard } from '../components/FloorCard';
import { SectionCard } from '../components/SectionCard';
import { StatusPill } from '../components/StatusPill';
import { useMonitoring } from '../context/MonitoringContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { AlertSeverity } from '../types/monitoring';
import { assessRo } from '../utils/monitoring';

type Props = NativeStackScreenProps<AppStackParamList, 'Hostel'>;

export function HostelScreen({ route, navigation }: Props) {
  const { hostelId } = route.params;
  const { getHostelById } = useMonitoring();
  const hostel = getHostelById(hostelId);
  const totalRos = hostel ? hostel.floors.reduce((sum, floor) => sum + floor.ro_list.length, 0) : 0;

  const summary = useMemo(() => {
    if (!hostel) {
      return null;
    }

    const assessments = hostel.floors.flatMap((floor) => floor.ro_list.map(assessRo));
    const critical = assessments.filter((item) => item.status === 'critical').length;
    const warning = assessments.filter((item) => item.status === 'warning').length;
    const status: AlertSeverity = critical > 0 ? 'critical' : warning > 0 ? 'warning' : 'safe';

    return { critical, warning, status };
  }, [hostel]);

  if (!hostel || !summary) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Hostel not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionCard>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{hostel.name}</Text>
            <Text style={styles.meta}>{hostel.id} · {hostel.floors.length} floors</Text>
          </View>
          <StatusPill status={summary.status} />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>{summary.critical} critical</Text>
          <Text style={styles.summaryItem}>{summary.warning} warning</Text>
          <Text style={styles.summaryItem}>{totalRos} total ROs</Text>
        </View>
      </SectionCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Floors</Text>
        <Text style={styles.sectionMeta}>Click a floor to drill down</Text>
      </View>

      <FlatList
        data={hostel.floors}
        keyExtractor={(floor) => `${hostel.id}-${floor.floor_number}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <FloorCard floor={item} onPress={() => navigation.navigate('Floor', { hostelId: hostel.id, floorNumber: item.floor_number })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
    color: '#eef6ff',
    fontSize: 24,
    fontWeight: '900',
  },
  meta: {
    color: '#8fa3b5',
    marginTop: 4,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    color: '#b8c8d6',
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#f3b6c1',
  },
});