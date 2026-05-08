import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function Header({ systemActive, currentTime }) {
  return (
    <View style={styles.header}>
      {/* Left - App branding */}
      <View style={styles.brandContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="locate" size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.brandTitle}>GPS<Text style={styles.brandAccent}>Track</Text></Text>
          <Text style={styles.brandSub}>Live Tracking Map</Text>
        </View>
      </View>

      {/* Right - Status and time */}
      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: systemActive ? Colors.success : Colors.danger }]} />
          <Text style={styles.statusText}>
            {systemActive ? 'Sistem Aktif' : 'Offline'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: Colors.primary,
  },
  brandSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
});
