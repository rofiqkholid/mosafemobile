import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import TrackingMap from '../components/TrackingMap';

export default function MapScreen({ locations, devices, loading, mapRef, currentTime }) {
  const activeDevices = devices.filter(d => d.is_active === 1).length;

  return (
    <View style={styles.container}>
      <Header systemActive={activeDevices > 0} currentTime={currentTime} />
      <View style={styles.mapWrapper}>
        <TrackingMap 
          locations={locations} 
          devices={devices} 
          loading={loading} 
          mapRef={mapRef} 
        />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.title}>Full Tracking Mode</Text>
        <Text style={styles.subtitle}>Memantau semua perangkat secara realtime</Text>
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
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 100, // Space for BottomTab
  },
  infoBox: {
    position: 'absolute',
    bottom: 120,
    left: 32,
    right: 32,
    backgroundColor: Colors.bgCard,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
