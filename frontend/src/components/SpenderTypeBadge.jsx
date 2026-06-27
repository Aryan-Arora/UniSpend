import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────
// SpenderTypeBadge
//
// Color-coded badge showing AI spender classification.
// ─────────────────────────────────────────────────────────────

const TYPES = {
  low: { label: 'Smart Saver', color: '#36FFC4', bg: 'rgba(54, 255, 196, 0.10)' },
  moderate: { label: 'Balanced', color: '#36FFC4', bg: 'rgba(54, 255, 196, 0.10)' },
  high: { label: 'Heavy Spender', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.10)' },
};

const SpenderTypeBadge = ({ type = 'moderate' }) => {
  const config = TYPES[type] || TYPES.moderate;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color + '30' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Syne-Bold',
  },
});

export default SpenderTypeBadge;
