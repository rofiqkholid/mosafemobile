import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function TrackingMap({ locations, loading }) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat peta...</Text>
      </View>
    );
  }

  return (
    <View style={styles.webPlaceholder}>
      <Ionicons name="map" size={48} color={Colors.border} />
      <Text style={styles.webPlaceholderText}>Peta tersedia di perangkat Mobile</Text>
      <View style={styles.webBadge}>
        <Text style={styles.webBadgeText}>{locations?.length || 0} Perangkat Terdeteksi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 320,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  webPlaceholder: {
    height: 320,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
    borderStyle: 'dashed',
  },
  webPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  webBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  webBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
