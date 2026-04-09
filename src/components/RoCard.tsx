import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RoUnit } from '../types/monitoring';
import { assessRo, formatLastUpdated } from '../utils/monitoring';
import { StatusPill } from './StatusPill';

type Props = {
  ro: RoUnit;
  onPress: () => void;
  compact?: boolean;
};

export function RoCard({ ro, onPress, compact = false }: Props) {
  const assessment = assessRo(ro);
  const hasMonkey = ro.monkey_detected;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{ro.id}</Text>
          <Text style={styles.subtitle}>{ro.hostel_name} · Floor {ro.floor_number} · RO {ro.ro_number}</Text>
        </View>
        <StatusPill status={assessment.status} compact />
      </View>
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Feather name="bell" size={14} color={assessment.alerts.length ? '#ff91a4' : '#6f8598'} />
          <Text style={styles.metaText}>{assessment.alerts.length} alerts</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="clock" size={14} color="#6f8598" />
          <Text style={styles.metaText}>{formatLastUpdated(ro.last_updated)}</Text>
        </View>
      </View>
      {hasMonkey ? (
        <View style={styles.monkeyBanner}>
          <Feather name="alert-triangle" size={14} color="#ffb1bb" />
          <Text style={styles.monkeyText}>Monkey event</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101c2a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e3041',
    padding: 16,
    gap: 14,
  },
  compact: {
    minWidth: 150,
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.94,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: '#f1f7ff',
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8699ab',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#7f93a6',
    fontSize: 12,
    fontWeight: '600',
  },
  monkeyBanner: {
    backgroundColor: '#3a0f18',
    borderColor: '#ff5b73',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  monkeyText: {
    color: '#ffced5',
    fontWeight: '800',
    fontSize: 12,
  },
});