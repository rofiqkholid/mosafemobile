import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TrackingMap from '../components/TrackingMap';
import DeviceCard from '../components/DeviceCard';

export default function DashboardScreen({ 
  locations, 
  devices, 
  loading, 
  refreshing, 
  error, 
  currentTime, 
  loadData,
  mapRef 
}) {
  // Navigate map to device
  const handleDevicePress = useCallback((device, location) => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    }
  }, [mapRef]);

  // Compute stats
  const totalDevices = devices?.length || 0;
  const activeDevices = devices?.filter(d => d.is_active === 1).length || 0;
  const totalVehicles = locations?.length || 0;
  const serviceCount = devices?.filter(d => (d.total_distance_km || 0) >= 2500).length || 0;

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressBackgroundColor={Colors.bgCard}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header systemActive={activeDevices > 0} currentTime={currentTime} title="Dashboard" />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard
                icon="hardware-chip-outline"
                iconColor={Colors.primary}
                iconBg="rgba(14, 165, 233, 0.15)"
                label="Total Perangkat"
                value={totalDevices}
                index={0}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                icon="checkmark-circle-outline"
                iconColor={Colors.success}
                iconBg={Colors.successBg}
                label="Perangkat Aktif"
                value={activeDevices}
                index={1}
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard
                icon="car-outline"
                iconColor={Colors.warning}
                iconBg={Colors.warningBg}
                label="Total Kendaraan"
                value={totalVehicles}
                index={2}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                icon="notifications-outline"
                iconColor={Colors.info}
                iconBg={Colors.infoBg}
                label="Notifikasi Service"
                value={serviceCount}
                index={3}
              />
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="map-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Live Tracking Map</Text>
            </View>
          </View>

          <TrackingMap
            locations={locations}
            devices={devices}
            loading={loading}
            mapRef={mapRef}
            showRoute={false}
          />
        </View>

        {/* Devices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="list-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Perangkat & Kendaraan</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="cloud-offline-outline" size={40} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : devices.length === 0 && !loading ? (
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
                onPress={handleDevicePress}
                index={idx}
              />
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            GPS<Text style={{ color: Colors.primary }}>Track</Text>
          </Text>
          <Text style={styles.footerText}>IoT GPS Tracking System</Text>
          <Text style={styles.footerCopy}>© 2026 All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for BottomTab
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  errorContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginHorizontal: 16,
    marginTop: 10,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
