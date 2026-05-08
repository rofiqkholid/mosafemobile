import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatTimeAgo } from '../api/tracker';

export default function DeviceCard({ device, location, onPress }) {
  const isActive = device?.is_active === 1;
  const statusColor = isActive ? Colors.success : Colors.danger;
  const statusText = isActive ? 'Online' : 'Offline';
  const statusBg = isActive ? Colors.successBg : Colors.dangerBg;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(device, location)}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.deviceIdContainer}>
          <View style={styles.deviceIcon}>
            <Ionicons name="hardware-chip-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.deviceId}>{device?.device_id || 'Unknown'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>  
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Kecepatan</Text>
          <Text style={styles.infoValue}>{(device?.estimated_speed || 0).toFixed(1)} km/h</Text>
        </View>
        
        <View style={styles.infoDivider} />
        
        <View style={styles.infoItem}>
          <Ionicons name="navigate-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Jarak Tempuh</Text>
          <Text style={styles.infoValue}>{(device?.total_distance_km || 0).toFixed(2)} km</Text>
        </View>
        
        <View style={styles.infoDivider} />
        
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Update</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {device?.seconds_ago ? formatTimeAgo(device.seconds_ago) : '-'}
          </Text>
        </View>
      </View>

      {/* Coordinates */}
      {location && (
        <View style={styles.coordsRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.coordsText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  deviceIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coordsText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
});
