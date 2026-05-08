import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import DeviceCard from '../components/DeviceCard';

export default function VehiclesScreen({ devices, locations, currentTime }) {
  const activeDevices = devices.filter(d => d.is_active === 1).length;
  
  // Build location lookup
  const locationMap = {};
  locations.forEach(loc => {
    locationMap[loc.device_id] = loc;
  });

  return (
    <View style={styles.container}>
      <Header systemActive={activeDevices > 0} currentTime={currentTime} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Ionicons name="car-outline" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Daftar Kendaraan & IoT</Text>
        </View>

        {devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Belum ada perangkat terdaftar</Text>
          </View>
        ) : (
          devices.map((device, idx) => (
            <DeviceCard
              key={device.device_id}
              device={device}
              location={locationMap[device.device_id]}
              index={idx}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
