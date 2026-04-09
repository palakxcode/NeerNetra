import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HostelUnit } from '../types/monitoring';
import { assessRo } from '../utils/monitoring';
import { StatusPill } from './StatusPill';

type Props = {
  hostel: HostelUnit;
  onPress: () => void;
};

export function HostelCard({ hostel, onPress }: Props) {
  const roAssessments = hostel.floors.flatMap((floor) => floor.ro_list.map(assessRo));
  const totalRos = hostel.floors.reduce((sum, floor) => sum + floor.ro_list.length, 0);
  const alertCount = roAssessments.reduce((sum, assessment) => sum + assessment.alerts.length, 0);
  const criticalCount = roAssessments.filter((assessment) => assessment.status === 'critical').length;
  const warningCount = roAssessments.filter((assessment) => assessment.status === 'warning').length;
  const status = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'safe';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{hostel.name}</Text>
          <Text style={styles.subtitle}>{hostel.floors.length} floors · {totalRos} ROs</Text>
        </View>
        <StatusPill status={status} />
      </View>
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statValue}>{totalRos}</Text>
          <Text style={styles.statLabel}>Total ROs</Text>
        </View>
        <View>
          <Text style={styles.statValue}>{alertCount}</Text>
          <Text style={styles.statLabel}>Active alerts</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101c2a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1c3044',
    padding: 16,
    gap: 18,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: '#f0f7ff',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: '#8fa3b5',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statValue: {
    color: '#d8faff',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#7f93a6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});