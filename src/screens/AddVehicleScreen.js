import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchAvailableDevices, addVehicle } from '../api/tracker';

export default function AddVehicleScreen({ onClose, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'motor',
    plate_number: '',
    brand: '',
    model: '',
    year: '',
    device_id: '',
    current_odometer: '0',
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const result = await fetchAvailableDevices();
      if (result && result.data) {
        setDevices(result.data);
      }
    } catch (e) {
      console.log('Failed to load devices, might be missing endpoint', e);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Nama Kendaraan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        current_odometer: formData.current_odometer ? parseInt(formData.current_odometer) : 0,
      };
      
      await addVehicle(payload);
      Alert.alert('Sukses', 'Kendaraan berhasil ditambahkan!', [
        { text: 'OK', onPress: () => {
          onAdded();
          onClose();
        }}
      ]);
    } catch (e) {
      Alert.alert('Gagal', e.message || 'Gagal menambahkan kendaraan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Kendaraan Baru</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Kendaraan <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Honda Beat 2024"
            placeholderTextColor={Colors.textMuted}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipe Kendaraan <Text style={styles.required}>*</Text></Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[styles.typeButton, formData.type === 'motor' && styles.typeButtonActive]}
              onPress={() => setFormData({...formData, type: 'motor'})}
            >
              <Ionicons name="bicycle" size={24} color={formData.type === 'motor' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.typeText, formData.type === 'motor' && styles.typeTextActive]}>Motor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, formData.type === 'mobil' && styles.typeButtonActive]}
              onPress={() => setFormData({...formData, type: 'mobil'})}
            >
              <Ionicons name="car" size={24} color={formData.type === 'mobil' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.typeText, formData.type === 'mobil' && styles.typeTextActive]}>Mobil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Plat Nomor</Text>
            <TextInput
              style={styles.input}
              placeholder="B 1234 XYZ"
              placeholderTextColor={Colors.textMuted}
              value={formData.plate_number}
              onChangeText={(text) => setFormData({...formData, plate_number: text})}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Tahun</Text>
            <TextInput
              style={styles.input}
              placeholder="2024"
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
              value={formData.year}
              onChangeText={(text) => setFormData({...formData, year: text})}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Merk</Text>
            <TextInput
              style={styles.input}
              placeholder="Honda"
              placeholderTextColor={Colors.textMuted}
              value={formData.brand}
              onChangeText={(text) => setFormData({...formData, brand: text})}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="Beat"
              placeholderTextColor={Colors.textMuted}
              value={formData.model}
              onChangeText={(text) => setFormData({...formData, model: text})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GPS Device</Text>
          <View style={styles.deviceListContainer}>
            <TouchableOpacity 
              style={[styles.deviceOption, !formData.device_id && styles.deviceOptionActive]}
              onPress={() => setFormData({...formData, device_id: ''})}
            >
              <Text style={[styles.deviceOptionText, !formData.device_id && styles.deviceOptionTextActive]}>
                Tidak terhubung (input manual)
              </Text>
            </TouchableOpacity>
            {devices.map(device => (
              <TouchableOpacity 
                key={device}
                style={[styles.deviceOption, formData.device_id === device && styles.deviceOptionActive]}
                onPress={() => setFormData({...formData, device_id: device})}
              >
                <Text style={[styles.deviceOptionText, formData.device_id === device && styles.deviceOptionTextActive]}>
                  {device}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hintText}>Jika terhubung GPS, odometer dihitung otomatis dari perjalanan GPS.</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Odometer Awal (KM)</Text>
            {!!formData.device_id && (
              <View style={styles.badge}>
                <Ionicons name="hardware-chip-outline" size={10} color={Colors.primary} />
                <Text style={styles.badgeText}>Auto dari GPS</Text>
              </View>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor={Colors.textMuted}
            value={formData.current_odometer}
            onChangeText={(text) => setFormData({...formData, current_odometer: text})}
          />
          <Text style={styles.hintText}>
            {formData.device_id 
              ? 'Odometer awal sebelum GPS dipasang. Jarak GPS akan ditambahkan di atas nilai ini.' 
              : 'Masukkan odometer manual jika tidak menggunakan GPS.'}
          </Text>
        </View>

        <View style={{height: 40}} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.saveButtonText}>Simpan Kendaraan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40, // For notch
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  required: {
    color: Colors.danger || '#ef4444',
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.bgCard,
    gap: 8,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`, // 20% opacity
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.primary,
  },
  deviceListContainer: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  deviceOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deviceOptionActive: {
    backgroundColor: `${Colors.primary}20`,
  },
  deviceOptionText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  deviceOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
