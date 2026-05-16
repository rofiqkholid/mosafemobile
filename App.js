import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from './src/constants/colors';
import { fetchDashboardData } from './src/api/tracker';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import MapScreen from './src/screens/MapScreen';
import ServiceScreen from './src/screens/ServiceScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';

// Components
import BottomTab from './src/components/BottomTab';

const AUTO_REFRESH_INTERVAL = 5000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABS_ORDER = ['dashboard', 'map', 'service', 'vehicles'];


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trails, setTrails] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const dashboardMapRef = useRef(null);
  const fullMapRef = useRef(null);
  
  // Use a single scroll value for the carousel
  const scrollX = useRef(new Animated.Value(0)).current;

  // Fetch data logic
  const loadData = useCallback(async (isRefresh = false) => {
    try { 
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchDashboardData();
      setLocations(data.locations || []);
      setDevices(data.devices || []);
      setVehicles(data.vehicles || []);
      setTrails(data.trails || {});
      setError(null);
    } catch (err) {
      setError('Gagal memuat data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), AUTO_REFRESH_INTERVAL);
    
    // Time update
    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Permission
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [loadData]);

  const handleTabPress = (tab) => {
    if (tab === activeTab) return;
    
    const nextIndex = TABS_ORDER.indexOf(tab);
    setActiveTab(tab);

    // Smooth scroll to the next screen
    Animated.spring(scrollX, {
      toValue: -nextIndex * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const renderScreens = () => {
    const props = { locations, devices, vehicles, trails, loading, refreshing, error, currentTime, loadData };
    
    const screens = [
      { id: 'dashboard', component: <DashboardScreen {...props} mapRef={dashboardMapRef} /> },
      { id: 'map', component: <MapScreen {...props} mapRef={fullMapRef} /> },
      { id: 'service', component: <ServiceScreen {...props} /> },
      { id: 'vehicles', component: <VehiclesScreen {...props} /> },
    ];


    return (
      <Animated.View style={[
        styles.carouselContainer,
        { transform: [{ translateX: scrollX }] }
      ]}>
        {screens.map((screen) => (
          <View key={screen.id} style={styles.screenWrapper}>
            {screen.component}
          </View>
        ))}
      </Animated.View>
    );
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
        <SafeAreaView style={styles.content} edges={['top']}>
          {renderScreens()}
        </SafeAreaView>
        <BottomTab activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  content: {
    flex: 1,
    overflow: 'hidden', // Hide other screens
  },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 4,
  },
  screenWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});
