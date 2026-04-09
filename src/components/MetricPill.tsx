import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string | number;
  tone?: 'cyan' | 'amber' | 'rose' | 'green';
};

const tones = {
  cyan: { background: '#102b34', border: '#2e7d8b', text: '#9beaf3' },
  amber: { background: '#2d2410', border: '#947621', text: '#ffd87b' },
  rose: { background: '#321218', border: '#aa4257', text: '#ff97a7' },
  green: { background: '#103525', border: '#23724b', text: '#8be7b5' },
};

export function MetricPill({ label, value, tone = 'cyan' }: Props) {
  const color = tones[tone];

  return (
    <View style={[styles.container, { backgroundColor: color.background, borderColor: color.border }]}>
      <Text style={[styles.value, { color: color.text }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    minWidth: 96,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    color: '#95a9ba',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});