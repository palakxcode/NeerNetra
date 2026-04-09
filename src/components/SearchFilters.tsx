import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FilterState } from '../types/monitoring';

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

export function SearchFilters({ filters, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by RO id, hostel, or floor"
        placeholderTextColor="#617486"
        value={filters.query}
        onChangeText={(query) => onChange({ ...filters, query })}
        style={styles.input}
      />
      <View style={styles.row}>
        {[
          { key: 'unsafeOnly', label: 'Unsafe only' },
          { key: 'monkeyOnly', label: 'Monkey alerts only' },
        ].map((option) => {
          const active = filters[option.key as keyof FilterState] as boolean;

          return (
            <Pressable
              key={option.key}
              onPress={() => onChange({ ...filters, [option.key]: !active })}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  input: {
    backgroundColor: '#0e1926',
    borderColor: '#1f3144',
    borderWidth: 1,
    borderRadius: 16,
    color: '#eef5ff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#223649',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0e1926',
  },
  chipActive: {
    backgroundColor: '#17394a',
    borderColor: '#4dd0e1',
  },
  chipText: {
    color: '#a8bccd',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#d7fbff',
  },
});