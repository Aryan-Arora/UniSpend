import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconForEmoji } from '../utils/iconMap';

// ─────────────────────────────────────────────────────────────
// AIUnavailableCard
//
// Graceful fallback when the AI API is unreachable.
// Shows a retry button.
// ─────────────────────────────────────────────────────────────

const AIUnavailableCard = ({ onRetry }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        <Ionicons name="sparkles" size={20} color="#E0E3E5" />
        <View style={styles.offlineDot} />
      </View>
      <Text style={styles.title}>AI Insights Unavailable</Text>
      <Text style={styles.description}>
        The AI service is warming up. This usually takes about 30 seconds.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconRow: {
    position: 'relative',
    marginBottom: 10,
  },
  icon: {
    fontSize: 32,
  },
  offlineDot: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6b6b',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  title: {
    color: '#E0E3E5',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Syne-Bold',
    marginBottom: 6,
  },
  description: {
    color: '#859399',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  retryText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIUnavailableCard;
