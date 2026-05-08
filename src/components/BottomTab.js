import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'map', label: 'Peta', icon: 'map-outline', activeIcon: 'map' },
  { id: 'service', label: 'Service', icon: 'construct-outline', activeIcon: 'construct' },
  { id: 'vehicles', label: 'Kendaraan', icon: 'car-outline', activeIcon: 'car' },
];

export default function BottomTab({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.tabLabel, { color: isActive ? Colors.primary : Colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgDark,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    minWidth: 70,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

});
