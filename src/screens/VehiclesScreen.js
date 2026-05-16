import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import DeviceCard from '../components/DeviceCard';
import AddVehicleScreen from './AddVehicleScreen';

export default function VehiclesScreen({ devices, locations, currentTime, loadData }) {
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  
  const activeDevices = devices.filter(d => d.is_active === 1).length;
  
  // Build location lookup
  const locationMap = {};
  if (Array.isArray(locations)) {
    locations.forEach(loc => {
      if (loc && loc.device_id) {
        locationMap[loc.device_id] = loc;
      }
    });
  }

  return (
    <View style={styles.container}>
      <Header systemActive={activeDevices > 0} currentTime={currentTime} title="Kendaraan" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="car-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Daftar Kendaraan & IoT</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Belum ada perangkat terdaftar</Text>
          </View>
        ) : (
          devices.map((device, idx) => (
            <DeviceCard
              key={device.device_id || `device-${idx}`}
              device={device}
              location={locationMap[device.device_id]}
              index={idx}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <AddVehicleScreen 
          onClose={() => setAddModalVisible(false)} 
          onAdded={() => {
            if (loadData) loadData(true);
          }}
        />
      </Modal>
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
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
