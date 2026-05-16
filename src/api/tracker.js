// MoSafe GPS Tracker - API Service
const BASE_URL = 'https://mosafe.fun/api';


/**
 * Fetch latest device locations
 * Returns: [{ device_id, latitude, longitude, speed, created_at }]
 */
export async function fetchLatestLocations() {
  try {
    const response = await fetch(`${BASE_URL}/latest-locations`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

/**
 * Fetch all devices with metadata
 * Returns: [{ device_id, last_update, seconds_ago, is_active, total_distance_km, estimated_speed }]
 */
export async function fetchDevices() {
  try {
    const response = await fetch(`${BASE_URL}/devices`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
}

/**
 * Fetch all vehicles with metadata
 * Returns: { status, data: [{ id, name, type, plate_number, is_online, current_odometer, service_status }] }
 */
export async function fetchVehicles() {
  try {
    const response = await fetch(`${BASE_URL}/vehicles`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Return empty fallback structure since backend might not be deployed yet
    return { status: 'error', data: [] };
  }
}

/**
 * Fetch historical GPS trails for all devices
 * Returns an object mapping device IDs to an array of {lat, lng}
 */
export async function fetchDeviceTrails() {
  try {
    const response = await fetch(`${BASE_URL}/device-trails`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching device trails:', error);
    return {};
  }
}

/**
 * Fetch both locations and devices in parallel
 */
export async function fetchDashboardData() {
  const [locations, devices, vehiclesResponse, trails] = await Promise.all([
    fetchLatestLocations(),
    fetchDevices(),
    fetchVehicles(),
    fetchDeviceTrails(),
  ]);
  return { 
    locations, 
    devices,
    vehicles: vehiclesResponse?.data || [],
    trails: trails || {},
  };
}

/**
 * Format seconds_ago into a human readable string
 */
export function formatTimeAgo(seconds) {
  if (seconds < 60) return `${seconds} detik lalu`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  return `${Math.floor(seconds / 86400)} hari lalu`;
}

/**
 * Format date string to local display
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Fetch available device IDs for the dropdown
 * Returns: { status, data: ['IOT-DEV-01', ...] }
 */
export async function fetchAvailableDevices() {
  try {
    const response = await fetch(`${BASE_URL}/available-devices`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching available devices:', error);
    throw error;
  }
}

/**
 * Add a new vehicle
 * Returns: { status, message, data }
 */
export async function addVehicle(vehicleData) {
  try {
    const response = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal menambahkan kendaraan');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
}

/**
 * Update an existing vehicle
 * Returns: { status, message, data }
 */
export async function updateVehicle(id, vehicleData) {
  try {
    const response = await fetch(`${BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal memperbarui kendaraan');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

/**
 * Add a service record to reset the service counter
 * Returns: { status, message, data }
 */
export async function addServiceRecord(id, component = 'Service Rutin') {
  try {
    const response = await fetch(`${BASE_URL}/vehicles/${id}/service`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ component }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal mencatat service');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding service record:', error);
    throw error;
  }
}


