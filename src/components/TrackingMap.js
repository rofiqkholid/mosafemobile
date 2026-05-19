import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Colors } from '../constants/colors';

const TrackingMap = forwardRef(({ locations = [], devices = [], trails = {}, loading, mapRef, showRoute = true }, ref) => {
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isRouting, setIsRouting] = useState(false);
  const [pickerMode, setPickerMode] = useState('focus'); // 'focus' or 'route'
  const [userLocation, setUserLocation] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
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

  // Expose methods to parent ref (ref)
  useImperativeHandle(ref, () => ({
    openPicker: (mode = 'focus') => {
      setPickerMode(mode);
      setShowDevicePicker(true);
    },
    clearRoute: () => setRouteCoords([]),
  }));

  // Bind parent's mapRef to support animateToRegion
  useEffect(() => {
    if (mapRef) {
      mapRef.current = {
        animateToRegion: (region, duration) => {
          const action = {
            type: 'animateToRegion',
            latitude: region.latitude,
            longitude: region.longitude,
            zoom: region.latitudeDelta ? Math.round(Math.log2(360 / region.latitudeDelta)) : 15
          };
          webViewRef.current?.injectJavaScript(`
            if (window.executeAction) {
              window.executeAction(${JSON.stringify(action)});
            }
          `);
        }
      };
    }
  }, [mapRef]);

  // Synchronize state data with the Leaflet WebView
  const sendDataToMap = () => {
    const data = {
      locations,
      devices,
      trails,
      routeCoords,
      userLocation
    };
    webViewRef.current?.injectJavaScript(`
      if (window.updateMapData) {
        window.updateMapData(${JSON.stringify(data)});
      }
    `);
  };

  useEffect(() => {
    sendDataToMap();
  }, [locations, devices, trails, routeCoords, userLocation]);

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
    if (location) {
      // Focus on Leaflet Map
      const action = {
        type: 'animateToRegion',
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: 15
      };
      webViewRef.current?.injectJavaScript(`
        if (window.executeAction) {
          window.executeAction(${JSON.stringify(action)});
        }
      `);

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
    if (userLocation) {
      const action = {
        type: 'animateToRegion',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        zoom: 15
      };
      webViewRef.current?.injectJavaScript(`
        if (window.executeAction) {
          window.executeAction(${JSON.stringify(action)});
        }
      `);
      return;
    }
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      if (location && location.coords) {
        const action = {
          type: 'animateToRegion',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          zoom: 15
        };
        webViewRef.current?.injectJavaScript(`
          if (window.executeAction) {
            window.executeAction(${JSON.stringify(action)});
          }
        `);
      }
    } catch (err) {
      console.warn('Focus me error:', err);
    }
  };

  // Center coordinate for map initialization
  const initialLat = locations?.[0]?.latitude || -6.289382;
  const initialLng = locations?.[0]?.longitude || 107.292801;

  // Leaflet HTML injection
  const MAP_HTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html, #map {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background-color: #0F172A;
        }
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.7) !important;
          color: #94A3B8 !important;
          font-size: 8px !important;
        }
        .marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-outer {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #0F172A;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.35);
        }
        .marker-outer.active {
          border-color: #22C55E;
        }
        .marker-outer.inactive {
          border-color: #EF4444;
        }
        .marker-pulse {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          opacity: 0.3;
          z-index: 1;
          bottom: -4px;
        }
        .marker-pulse.active {
          background-color: #22C55E;
          animation: pulse 1.5s infinite;
        }
        .marker-pulse.inactive {
          background-color: #EF4444;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .user-location-outer {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .user-location-inner {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #3B82F6;
          border: 2px solid #FFFFFF;
          animation: userPulse 2s infinite;
        }
        @keyframes userPulse {
          0% {
            box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.5);
          }
          100% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        .leaflet-popup-content-wrapper {
          background: #1E293B !important;
          color: #F1F5F9 !important;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 2px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .leaflet-popup-tip {
          background: #1E293B !important;
          border: 1px solid #334155;
        }
        .popup-title {
          font-weight: 700;
          color: #F1F5F9;
          font-size: 13px;
          margin-bottom: 2px;
        }
        .popup-desc {
          color: #94A3B8;
          font-size: 11px;
        }
      </style>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: true
        }).setView([${initialLat}, ${initialLng}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        var markers = {};
        var userMarker = null;
        var polylines = {};
        var routePolyline = null;
        
        function createVehicleIcon(isActive) {
          var color = isActive ? '#22C55E' : '#EF4444';
          var outerClass = isActive ? 'active' : 'inactive';
          var pulseClass = isActive ? 'active' : 'inactive';
          
          var html = '<div class="marker-container">' +
            '<div class="marker-outer ' + outerClass + '">' +
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="' + color + '">' +
                '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zM7.5 13c-.83 0-1.5.67-1.5 1.5S6.67 16 7.5 16s1.5-.67 1.5-1.5S8.33 13 7.5 13zm9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>' +
              '</svg>' +
            '</div>' +
            '<div class="marker-pulse ' + pulseClass + '"></div>' +
          '</div>';
          
          return L.divIcon({
            html: html,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
        }
        
        var userIcon = L.divIcon({
          html: '<div class="user-location-outer"><div class="user-location-inner"></div></div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        window.updateMapData = function(data) {
          if (!data) return;
          
          var locations = data.locations || [];
          var devices = data.devices || [];
          var trails = data.trails || {};
          var routeCoords = data.routeCoords || [];
          var userLocation = data.userLocation;
          
          var deviceMap = {};
          devices.forEach(function(d) {
            if (d && d.device_id) deviceMap[d.device_id] = d;
          });
          
          var activeDeviceIds = {};
          locations.forEach(function(loc) {
            if (!loc) return;
            var id = loc.device_id;
            activeDeviceIds[id] = true;
            var lat = loc.latitude;
            var lng = loc.longitude;
            var dev = deviceMap[id];
            var isActive = dev ? dev.is_active === 1 : false;
            var speed = loc.speed || 0;
            
            var popupContent = '<div style="padding: 4px;">' +
              '<div class="popup-title">' + id + '</div>' +
              '<div class="popup-desc">Speed: ' + speed + ' km/h &bull; ' + (isActive ? 'Online' : 'Offline') + '</div>' +
            '</div>';
            
            if (markers[id]) {
              markers[id].setLatLng([lat, lng]);
              markers[id].setIcon(createVehicleIcon(isActive));
              markers[id].getPopup().setContent(popupContent);
            } else {
              markers[id] = L.marker([lat, lng], { icon: createVehicleIcon(isActive) })
                .addTo(map)
                .bindPopup(popupContent);
            }
          });
          
          for (var id in markers) {
            if (!activeDeviceIds[id]) {
              map.removeLayer(markers[id]);
              delete markers[id];
            }
          }
          
          if (userLocation) {
            if (userMarker) {
              userMarker.setLatLng([userLocation.latitude, userLocation.longitude]);
            } else {
              userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
                .addTo(map)
                .bindPopup('<div style="padding:4px;"><div class="popup-title">Lokasi Anda</div></div>');
            }
          } else if (userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
          }
          
          if (routeCoords.length === 0) {
            if (routePolyline) {
              map.removeLayer(routePolyline);
              routePolyline = null;
            }
            
            var activeTrailIds = {};
            for (var deviceId in trails) {
              var trailCoords = trails[deviceId] || [];
              if (trailCoords.length < 2) continue;
              
              activeTrailIds[deviceId] = true;
              var latlngs = trailCoords.map(function(c) { return [c.lat, c.lng]; });
              
              if (polylines[deviceId]) {
                polylines[deviceId].setLatLngs(latlngs);
              } else {
                polylines[deviceId] = L.polyline(latlngs, {
                  color: '#0EA5E9',
                  weight: 3,
                  opacity: 0.8
                }).addTo(map);
              }
            }
            
            for (var dId in polylines) {
              if (!activeTrailIds[dId]) {
                map.removeLayer(polylines[dId]);
                delete polylines[dId];
              }
            }
          } else {
            for (var dId in polylines) {
              map.removeLayer(polylines[dId]);
            }
            polylines = {};
            
            var routeLatLngs = routeCoords.map(function(c) { return [c.latitude, c.longitude]; });
            if (routePolyline) {
              routePolyline.setLatLngs(routeLatLngs);
            } else {
              routePolyline = L.polyline(routeLatLngs, {
                color: '#0EA5E9',
                weight: 4,
                opacity: 0.9,
                dashArray: '5, 8'
              }).addTo(map);
            }
          }
        };
        
        window.executeAction = function(action) {
          if (!action) return;
          if (action.type === 'animateToRegion') {
            map.flyTo([action.latitude, action.longitude], action.zoom || 15, {
              animate: true,
              duration: 1.2
            });
          }
        };
      </script>
    </body>
    </html>
  `;

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
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: MAP_HTML }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={sendDataToMap}
        scrollEnabled={false}
      />

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
          <Ionicons name="car" size={22} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleFocusMe}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color={Colors.success} />
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
    backgroundColor: Colors.bgDark,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
