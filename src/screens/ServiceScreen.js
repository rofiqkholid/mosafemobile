import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Header from '../components/Header';

export default function ServiceScreen({ devices, currentTime }) {
  const activeDevices = devices?.filter(d => d.is_active === 1).length || 0;

  return (
    <View style={styles.container}>
      <Header systemActive={activeDevices > 0} currentTime={currentTime} title="Service" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="construct-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Catatan Service</Text>
          <Text style={styles.emptyText}>Belum ada riwayat service untuk perangkat ini.</Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              Service rutin disarankan setiap 2.500 KM untuk menjaga performa alat IoT tetap optimal.
            </Text>
          </View>
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
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    marginTop: 40,
    backgroundColor: Colors.bgCard,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
