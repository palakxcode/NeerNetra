import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FloorUnit } from '../types/monitoring';
import { assessRo } from '../utils/monitoring';
import { StatusPill } from './StatusPill';

type Props = {
  floor: FloorUnit;
  onPress: () => void;
};

export function FloorCard({ floor, onPress }: Props) {
  const roAssessments = floor.ro_list.map(assessRo);
  const criticalCount = roAssessments.filter((item) => item.status === 'critical').length;
  const warningCount = roAssessments.filter((item) => item.status === 'warning').length;
  const status = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'safe';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.title}>Floor {floor.floor_number}</Text>
        <StatusPill status={status} compact />
      </View>
      <View style={styles.body}>
        {floor.ro_list.map((ro) => {
          const assessment = assessRo(ro);
          return (
            <View key={ro.id} style={styles.roRow}>
              <Text style={styles.roId}>{ro.id}</Text>
              <Text style={[styles.roState, assessment.status === 'critical' && styles.critical, assessment.status === 'warning' && styles.warning]}>
                {assessment.status.toUpperCase()}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.note}>{criticalCount} critical, {warningCount} warning</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101c2a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1b2e40',
    padding: 14,
    gap: 12,
  },
  pressed: {
    opacity: 0.95,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#eef5ff',
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    gap: 10,
  },
  roRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roId: {
    color: '#9cb0c1',
    fontWeight: '700',
  },
  roState: {
    color: '#8df0b8',
    fontWeight: '800',
  },
  critical: {
    color: '#ff91a4',
  },
  warning: {
    color: '#ffd56b',
  },
  note: {
    color: '#7d90a3',
    fontSize: 12,
    fontWeight: '600',
  },
});