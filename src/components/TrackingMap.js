import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/colors';

import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

const TrackingMap = forwardRef(({ locations = [], devices = [], trails = {}, loading, mapRef, showRoute = true }, ref) => {
  const [showDevicePicker, setShowDevicePicker] = React.useState(false);
  const [routeCoords, setRouteCoords] = React.useState([]);
  const [isRouting, setIsRouting] = React.useState(false);
  const [pickerMode, setPickerMode] = React.useState('focus'); // 'focus' or 'route'
  const [userLocation, setUserLocation] = React.useState(null);

  React.useEffect(() => {
    let locationSubscription;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          if (loc && loc.coords) {
            setUserLocation(loc.coords);
          }
          // Watch for updates
          locationSubscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
            (newLoc) => {
              if (newLoc && newLoc.coords) {
                setUserLocation(newLoc.coords);
              }
            }
          );
        }
      } catch (e) {
        console.warn('Location tracking error:', e);
      }
    })();
    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    openPicker: (mode = 'focus') => {
      setPickerMode(mode);
      setShowDevicePicker(true);
    },
    clearRoute: () => setRouteCoords([]),
  }));


  // Fetch route from OSRM
  const fetchRoute = async (userCoords, deviceCoords) => {
    try {
      setIsRouting(true);
      const url = `https://router.project-osrm.org/route/v1/driving/${userCoords.longitude},${userCoords.latitude};${deviceCoords.longitude},${deviceCoords.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(c => ({
          latitude: c[1],
          longitude: c[0]
        }));
        setRouteCoords(coords);
      }
    } catch (err) {
      console.warn('Routing error:', err);
    } finally {
      setIsRouting(false);
    }
  };

  // Focus or Route selected IoT device
  const handleSelectDevice = async (device, location) => {
    if (location && mapRef && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);

      if (pickerMode === 'route' && showRoute) {
        if (userLocation) {
          fetchRoute(userLocation, location);
        } else {
          // Fallback
          try {
            const loc = await Location.getCurrentPositionAsync({});
            if (loc && loc.coords) fetchRoute(loc.coords, location);
          } catch (e) {}
        }
      }
    }
    setShowDevicePicker(false);
  };


  const handleFocusIoT = () => {
    if (locations && locations.length > 0) {
      setPickerMode('focus');
      setShowDevicePicker(true);
    }
  };


  // Focus on user location
  const handleFocusMe = async () => {
    if (userLocation && mapRef && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
      return;
    }
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      if (location && location.coords && mapRef && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 800);
      }
    } catch (err) {
      console.warn('Focus me error:', err);
    }
  };

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

  // Build a map of device_id -> device for quick lookup
  const deviceMap = {};
  if (devices && Array.isArray(devices)) {
    devices.forEach(d => {
      if (d && d.device_id) {
        deviceMap[d.device_id] = d;
      }
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion}
        mapType="none"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        <UrlTile
          urlTemplate="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&scale=2"
          maximumZ={20}
          tileSize={512}
          flipY={false}
        />
        
        {/* Custom User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
            title="Lokasi Anda"
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={999}
          >
            <View style={styles.userLocationOuter}>
              <View style={styles.userLocationInner} />
            </View>
          </Marker>
        )}

        {Array.isArray(locations) && locations.map((loc, idx) => {
          if (!loc) return null;
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
                  { borderColor: isActive ? Colors.success : Colors.danger }
                ]}>
                  <Ionicons
                    name="car"
                    size={22}
                    color={isActive ? Colors.success : Colors.danger}
                  />
                </View>
                <View style={[
                  styles.markerPulse,
                  { backgroundColor: isActive ? Colors.success : Colors.danger }
                ]} />
              </View>
            </Marker>
          );
        })}

        {/* Historical GPS Trails (Hidden when routing is active) */}
        {routeCoords.length === 0 && trails && Object.entries(trails).map(([deviceId, trailCoords]) => {
          if (!trailCoords || trailCoords.length < 2) return null;
          const isActive = deviceMap[deviceId]?.is_active === 1;
          const mapCoords = trailCoords.map(c => ({ latitude: c.lat, longitude: c.lng }));
          
          return (
            <Polyline
              key={`trail-${deviceId}`}
              coordinates={mapCoords}
              strokeWidth={3}
              strokeColor={Colors.primary}
            />
          );
        })}

        {/* OSRM Route to Device */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor={Colors.primary}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* Map Overlay - Top Left Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Online</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.legendText}>Offline</Text>
        </View>
        
        {routeCoords.length > 0 && (
          <TouchableOpacity 
            style={styles.clearRouteBtn} 
            onPress={() => setRouteCoords([])}
          >
            <Ionicons name="close-circle" size={16} color={Colors.danger} />
            <Text style={styles.clearRouteText}>Hapus Rute</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map Controls - Floating Right */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleFocusIoT}
          activeOpacity={0.8}
        >
          <Ionicons name="car" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleFocusMe}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={24} color={Colors.success} />
        </TouchableOpacity>
      </View>

      {/* Device Picker Bottom Sheet */}
      <Modal
        visible={showDevicePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDevicePicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowDevicePicker(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                {pickerMode === 'route' ? 'Pilih Tujuan Rute' : 'Pilih Perangkat untuk Fokus'}
              </Text>
            </View>

            <FlatList
              data={locations}
              keyExtractor={(item) => item.device_id}
              contentContainerStyle={styles.sheetList}
              renderItem={({ item }) => {
                const device = devices?.find(d => d.device_id === item.device_id);
                const isActive = device?.is_active === 1;
                
                return (
                  <TouchableOpacity 
                    style={styles.deviceItem}
                    onPress={() => handleSelectDevice(device, item)}
                  >
                    <View style={[styles.itemIcon, { backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Ionicons 
                        name="car" 
                        size={20} 
                        color={isActive ? Colors.success : Colors.danger} 
                      />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{item.device_id}</Text>
                      <Text style={styles.itemSub}>
                        Speed: {item.speed || 0} km/h • {isActive ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

export default TrackingMap;


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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    overflow: 'hidden',
  },
  markerPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.3,
    marginTop: -6,
    zIndex: 1,
  },
  userLocationOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff',
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
  controlsContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  controlButton: {
    backgroundColor: '#1E293B',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 10,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetList: {
    padding: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.bgDark,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  clearRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearRouteText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
});
