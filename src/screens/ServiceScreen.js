import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { addServiceRecord } from '../api/tracker';

export default function ServiceScreen({ vehicles, devices, currentTime, loadData }) {
  const [loadingId, setLoadingId] = useState(null);
  const activeDevices = devices?.filter(d => d.is_active === 1).length || 0;

  const handleService = async (vehicleId, componentName) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menandai komponen ini sudah diservice? Ini akan mereset hitungan interval KM ke 0.",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Sudah Service", 
          onPress: async () => {
            setLoadingId(`${vehicleId}-${componentName}`);
            try {
              await addServiceRecord(vehicleId, componentName);
              Alert.alert("Sukses", "Catatan service berhasil disimpan.");
              if (loadData) loadData(true);
            } catch (e) {
              Alert.alert("Gagal", e.message || "Gagal mencatat service");
            } finally {
              setLoadingId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header systemActive={activeDevices > 0} currentTime={currentTime} title="Service Kendaraan" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Ionicons name="construct-outline" size={20} color={Colors.info} />
          <Text style={styles.sectionTitle}>Jadwal & Status Service</Text>
        </View>

        {!vehicles || vehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="car-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Kendaraan</Text>
            <Text style={styles.emptyText}>Tambahkan kendaraan terlebih dahulu di menu Kendaraan.</Text>
          </View>
        ) : (
          vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <Ionicons 
                  name={vehicle.type === 'motor' ? 'bicycle' : 'car'} 
                  size={18} 
                  color={Colors.textPrimary} 
                />
                <View style={styles.vehicleTitleContainer}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehiclePlate}>{vehicle.plate_number || 'Tanpa Plat'} • {vehicle.current_odometer} km</Text>
                </View>
              </View>

              {!vehicle.service_details || vehicle.service_details.length === 0 ? (
                <Text style={styles.noServiceText}>Tidak ada jadwal service untuk kendaraan ini.</Text>
              ) : (
                vehicle.service_details.map((service, idx) => {
                  const isWarning = service.status === 'warning';
                  const isDanger = service.status === 'danger';
                  const progressColor = isDanger ? Colors.danger : isWarning ? Colors.warning : Colors.success;
                  const isLoading = loadingId === `${vehicle.id}-${service.component}`;

                  return (
                    <View key={idx} style={styles.serviceItem}>
                      <View style={styles.serviceHeader}>
                        <Text style={styles.componentName}>{service.component}</Text>
                        <Text style={[styles.statusBadge, { 
                          color: progressColor, 
                          backgroundColor: `${progressColor}20` 
                        }]}>
                          {isDanger ? 'Segera Service!' : isWarning ? 'Mendekati' : 'Aman'}
                        </Text>
                      </View>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { 
                            width: `${service.progress}%`,
                            backgroundColor: progressColor 
                          }]} />
                        </View>
                        <View style={styles.progressTextRow}>
                          <Text style={styles.progressText}>{service.km_since_service} km</Text>
                          <Text style={styles.progressText}>{service.interval_km} km</Text>
                        </View>
                      </View>

                      {isDanger && (
                        <View style={styles.actionContainer}>
                          <Text style={styles.warningText}>
                            <Ionicons name="warning" size={14} /> Batas jarak tempuh telah tercapai!
                          </Text>
                          <TouchableOpacity 
                            style={styles.serviceButton}
                            onPress={() => handleService(vehicle.id, service.component)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                                <Text style={styles.serviceButtonText}>Catat Sudah Service</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          ))
        )}
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
    padding: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
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
  vehicleCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardLight,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  vehicleTitleContainer: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vehiclePlate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  noServiceText: {
    padding: 16,
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  serviceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  componentName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  serviceButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
