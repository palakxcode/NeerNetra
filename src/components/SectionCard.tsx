import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function SectionCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101c2a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1c2d3f',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});