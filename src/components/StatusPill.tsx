import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AlertSeverity } from '../types/monitoring';
import { getStatusLabel } from '../utils/monitoring';

type Props = {
  status: AlertSeverity;
  compact?: boolean;
};

const colors: Record<AlertSeverity, { background: string; border: string; text: string }> = {
  safe: { background: '#103526', border: '#1f7d4d', text: '#8df0b8' },
  warning: { background: '#312a10', border: '#8b6e20', text: '#ffd56b' },
  critical: { background: '#351216', border: '#e85d73', text: '#ff91a4' },
};

export function StatusPill({ status, compact = false }: Props) {
  const color = colors[status];

  return (
    <View style={[styles.pill, { backgroundColor: color.background, borderColor: color.border }, compact && styles.compact]}>
      <Text style={[styles.text, { color: color.text }]}>{getStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontSize: 11,
  },
});