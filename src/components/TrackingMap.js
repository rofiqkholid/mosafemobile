import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Conditional import for maps
let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function TrackingMap({ locations, devices, loading, mapRef }) {
  // Default region
  const defaultRegion = {
    latitude: locations?.[0]?.latitude || -6.289382,
    longitude: locations?.[0]?.longitude || 107.292801,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat peta...</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
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

  // Build a map of device_id -> device for quick lookup
  const deviceMap = {};
  if (devices) {
    devices.forEach(d => {
      deviceMap[d.device_id] = d;
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion}
        mapType="satellite"
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        {locations?.map((loc, idx) => {
          const dev = deviceMap[loc.device_id];
          const isActive = dev?.is_active === 1;

          return (
            <Marker
              key={`${loc.device_id}-${idx}`}
              coordinate={{
                latitude: loc.latitude,
                longitude: loc.longitude,
              }}
              title={loc.device_id}
              description={`Speed: ${loc.speed || 0} km/h`}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.markerOuter,
                  { borderColor: isActive ? Colors.success : Colors.primary }
                ]}>
                  <Ionicons
                    name="bicycle"
                    size={18}
                    color={isActive ? Colors.success : Colors.primary}
                  />
                </View>
                <View style={[
                  styles.markerPulse,
                  { backgroundColor: isActive ? Colors.success : Colors.primary }
                ]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Map Overlay - Top Left Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Online</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Offline</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  map: {
    flex: 1,
  },
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  markerPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.3,
    marginTop: -6,
    zIndex: 1,
  },
  legendContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.mapOverlay,
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});
