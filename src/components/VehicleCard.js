import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function VehicleCard({ vehicle }) {
  if (!vehicle) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={vehicle.type === 'motor' ? 'bicycle' : 'car'} 
            size={20} 
            color="#fff" 
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{vehicle.name}</Text>
          <Text style={styles.plate}>{vehicle.plate_number || 'Tanpa Plat'}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>KONEKSI PERANGKAT GPS</Text>
        
        {vehicle.device_id ? (
          <View style={styles.deviceIdBadge}>
            <Ionicons name="hardware-chip-outline" size={14} color={Colors.danger} />
            <Text style={styles.deviceIdText}>{vehicle.device_id}</Text>
          </View>
        ) : (
          <Text style={styles.noDeviceText}>Tidak ada perangkat GPS terhubung</Text>
        )}

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: vehicle.is_online ? Colors.success : Colors.danger }]} />
            <Text style={[styles.statusText, { color: vehicle.is_online ? Colors.success : Colors.danger }]}>
              {vehicle.is_online ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.statusItem}>
            <Ionicons name="car-outline" size={14} color={Colors.primary} />
            <Text style={styles.odometerText}>{vehicle.current_odometer} km</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="pricetag-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.detailsText}>
            {vehicle.brand || '-'} {vehicle.model || '-'}
          </Text>
          <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} style={{marginLeft: 8}} />
          <Text style={styles.detailsText}>{vehicle.year || '-'}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[
          styles.serviceBadge, 
          { backgroundColor: vehicle.service_status === 'Semua aman' ? `${Colors.success}15` : `${Colors.warning}15` }
        ]}>
          <Ionicons 
            name={vehicle.service_status === 'Semua aman' ? 'checkmark-circle' : 'warning'} 
            size={14} 
            color={vehicle.service_status === 'Semua aman' ? Colors.success : Colors.warning} 
          />
          <Text style={[
            styles.serviceText,
            { color: vehicle.service_status === 'Semua aman' ? Colors.success : Colors.warning }
          ]}>
            {vehicle.service_status}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardLight,
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  plate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  body: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  deviceIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
    gap: 6,
  },
  deviceIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  noDeviceText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  separator: {
    width: 1,
    height: 12,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 12,
  },
  odometerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
    backgroundColor: Colors.bgDark,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  serviceText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
