import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import TrackingMap from '../components/TrackingMap';
import DeviceCard from '../components/DeviceCard';

export default function MapScreen({ locations, devices, trails, loading, mapRef, currentTime }) {
  const activeDevices = devices?.filter(d => d.is_active === 1).length || 0;
  const trackingMapRef = useRef(null);

  return (
    <View style={styles.container}>
      <Header systemActive={activeDevices > 0} currentTime={currentTime} title="Peta" />
      
      {/* Map Hero Section */}
      <View style={styles.mapWrapper}>
        <TrackingMap 
          ref={trackingMapRef}
          locations={locations} 
          devices={devices}
          trails={trails}
          loading={loading} 
          mapRef={mapRef} 
        />
      </View>

      {/* Device List Section */}
      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Daftar Kendaraan</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.routeBtn}
            onPress={() => trackingMapRef.current?.openPicker('route')}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate-circle" size={18} color="#FFFFFF" />
            <Text style={styles.routeBtnText}>Rute</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.listContent} 
          showsVerticalScrollIndicator={false}
        >
          {devices?.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada perangkat terdeteksi</Text>
            </View>
          ) : (
            devices?.map((device, idx) => {
              const location = locations?.find(loc => loc.device_id === device.device_id);
              return (
                <DeviceCard
                  key={device.device_id}
                  device={device}
                  location={location}
                  onPress={(d, l) => {
                    if (l && mapRef.current) {
                      mapRef.current.animateToRegion({
                        latitude: l.latitude,
                        longitude: l.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }, 800);
                    }
                  }}
                  index={idx}
                />
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  mapWrapper: {
    height: '45%', // hero map
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  routeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120, // space for tab bar
  },
  emptyContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
