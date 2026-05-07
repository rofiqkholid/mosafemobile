import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchDashboardData, formatTimeAgo } from '../api/tracker';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TrackingMap from '../components/TrackingMap';
import DeviceCard from '../components/DeviceCard';

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export default function DashboardScreen() {
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const mapRef = useRef(null);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      const data = await fetchDashboardData();
      setLocations(data.locations || []);
      setDevices(data.devices || []);
    } catch (err) {
      setError('Gagal memuat data. Tarik ke bawah untuk mencoba lagi.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

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
  }, []);

  // Compute stats
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.is_active === 1).length;
  const totalVehicles = locations.length;
  const offlineDevices = totalDevices - activeDevices;

  // Build location lookup
  const locationMap = {};
  locations.forEach(loc => {
    locationMap[loc.device_id] = loc;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressBackgroundColor={Colors.bgCard}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header systemActive={activeDevices > 0} currentTime={currentTime} />

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
                value={offlineDevices}
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
            <View style={styles.refreshBadge}>
              <Ionicons name="refresh-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.refreshText}>Auto 30s</Text>
            </View>
          </View>
          <TrackingMap
            locations={locations}
            devices={devices}
            loading={loading}
            mapRef={mapRef}
          />
        </View>

        {/* Devices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="list-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Perangkat & Kendaraan</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalDevices}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
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
  refreshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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
