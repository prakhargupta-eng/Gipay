import Geolocation from '@react-native-community/geolocation';
import {useEffect, useState} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import {PERMISSIONS, request, RESULTS, check} from 'react-native-permissions';
import { Toast } from '@utils/ToastManager';
import strings from '@constants/strings';
import { useSystemStore } from '@store/useSystemStore';
import { devDebugger } from '@utils/devDebugger';
import { convertToMeters } from '@utils/mapUtils';

const isIos = Platform.OS === 'ios';

// Configure Geolocation to use Google Play Services (FusedLocationProvider) on Android
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'playServices',
  enableBackgroundLocationUpdates: false,
});

type LocationType = {
  latitude: number;
  longitude: number;
};

// Module-level cache & concurrency locks to prevent Android Geolocation crashes
let activeLocationFetchPromise: Promise<LocationType | null> | null = null;
let cachedLocation: LocationType | null = null;
let cachedLocationTimestamp = 0;
let positionRequestQueue: Promise<any> = Promise.resolve();

const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Sequential queue for native Geolocation.getCurrentPosition calls to prevent concurrent calls on Android
const executeSinglePositionRequest = (options: any): Promise<LocationType> => {
  return new Promise<LocationType>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        if (isValidCoordinate(latitude, longitude)) {
          resolve({latitude, longitude});
        } else {
          reject(new Error('Invalid coordinates received'));
        }
      },
      error => {
        reject(error);
      },
      options,
    );
  });
};

const getCurrentPositionWithOptions = (options: any): Promise<LocationType | null> => {
  const nextRequest = positionRequestQueue
    .catch(() => {})
    .then(() => executeSinglePositionRequest(options));

  positionRequestQueue = nextRequest;
  return nextRequest;
};

export const useLocation = () => {
  const [location, setLocation] = useState<LocationType | null>(cachedLocation);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!cachedLocation);

  useEffect(() => {
      requestLocationAccess();
  }, []);

  const requestLocationAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const permission = isIos
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      // Check current permission status first
      let status = await check(permission);

      // Case 1: If not requested yet (DENIED means it hasn't been requested OR is requestable again)
      if (status === RESULTS.DENIED) {
        status = await request(permission);
      }

      devDebugger.log('Permission status:', status);

      // Case 2: If user denied or stopped it in settings (BLOCKED or ultimately still DENIED)
      if (status === RESULTS.BLOCKED || status === RESULTS.DENIED) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in settings to use this feature.',
          [
            {text: 'Cancel', style: 'cancel', onPress: () => setLoading(false)},
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
                setLoading(false);
              },
            },
          ],
        );
        setError('Location permission is blocked');
        return;
      }


      if (status !== RESULTS.GRANTED) {
        setError('Location permission not granted');
        setLoading(false);
        return;
      }

      // Enable GPS (Android Only)
      if (!isIos) {
        try {
          await promptForEnableLocationIfNeeded();
          devDebugger.log('GPS enabled successfully');
        } catch (error: any) {
          devDebugger.log('GPS enable error:', error);
          if (error?.code === 'ERR_ALREADY_ENABLED') {
            // GPS is already enabled, continue
          } else {
            // Don't block if GPS enable fails, try to get location anyway
            devDebugger.log('GPS enable failed, but continuing...');
          }
        }
      }

      // Try to get location with multiple strategies (deduplicated across instances)
      await getLocationWithMultipleStrategies();
    } catch (error: any) {
      devDebugger.error('Error requesting location:', error);
      setError(error.message || 'Failed to get location');
      setLoading(false);
    }
  };

  const getLocationWithMultipleStrategies = async (force = false): Promise<LocationType | null> => {
    // If we have recent cached location (less than 30s) and not forced, return it
    if (!force && cachedLocation && Date.now() - cachedLocationTimestamp < 30000) {
      setLocation(cachedLocation);
      setError(null);
      setLoading(false);
      return cachedLocation;
    }

    // Deduplicate in-flight fetch: reuse active promise
    if (activeLocationFetchPromise) {
      devDebugger.log('Reusing in-flight location request...');
      try {
        const loc = await activeLocationFetchPromise;
        if (loc) {
          setLocation(loc);
          setError(null);
        }
        return loc;
      } finally {
        setLoading(false);
      }
    }

    activeLocationFetchPromise = (async () => {
      const strategies = [
        // Strategy 1: Google Fused Location with High accuracy
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
        // Strategy 2: Low/Balanced accuracy with medium timeout
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
          forceRequestLocation: false,
        },
        // Strategy 3: Cached / Last Known Location fallback
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 2 * 60 * 60 * 1000, // 2 hours
          forceRequestLocation: false,
        },
      ];

      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        devDebugger.log(`Trying location strategy ${i + 1}`, strategy);

        try {
          const loc = await getCurrentPositionWithOptions(strategy);
          if (loc) {
            cachedLocation = loc;
            cachedLocationTimestamp = Date.now();
            devDebugger.log(`✅ Location obtained with strategy ${i + 1}:`, loc);
            return loc;
          }
        } catch (err) {
          devDebugger.log(`Strategy ${i + 1} failed:`, err);
          // Continue to next strategy
        }
      }

      // Try last known cached location before giving up
      try {
        const lastKnown = await getLastKnownLocation();
        if (lastKnown) {
          cachedLocation = lastKnown;
          cachedLocationTimestamp = Date.now();
          devDebugger.log('✅ Location obtained from last known cached fallback:', lastKnown);
          return lastKnown;
        }
      } catch (lastErr) {
        devDebugger.log('Last known fallback failed:', lastErr);
      }

      return null;
    })().finally(() => {
      activeLocationFetchPromise = null;
    });

    const result = await activeLocationFetchPromise;
    if (result) {
      setLocation(result);
      setError(null);
    } else {
      const errorMsg = 'Please turn on the GPS';
      Toast.show({ type: 'error', text2: errorMsg });
      setError(errorMsg);
    }
    setLoading(false);
    return result;
  };

  // Alternative method using watchPosition (sometimes more reliable)
  const getLocationWithWatchPosition = (): Promise<LocationType> => {
    return new Promise((resolve, reject) => {
      let watchId: number;
      let timeoutId: ReturnType<typeof setTimeout>;

      // Set timeout for watch position
      timeoutId = setTimeout(() => {
        Geolocation.clearWatch(watchId);
        reject(new Error('Location watch timeout'));
      }, 20000);

      watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          if (isValidCoordinate(latitude, longitude)) {
            clearTimeout(timeoutId);
            Geolocation.clearWatch(watchId);
            resolve({latitude, longitude});
          }
        },
        error => {
          clearTimeout(timeoutId);
          Geolocation.clearWatch(watchId);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000,
        },
      );
    });
  };

  // Enhanced retry with different methods
  const retryLocation = async (useWatchMethod = false) => {
    setLoading(true);
    setError(null);

    try {
      let location: LocationType | null = null;

      if (useWatchMethod) {
        devDebugger.log('Retrying with watch position method...');
        location = await getLocationWithWatchPosition();
      } else {
        devDebugger.log('Retrying with multiple strategies...');
        await getLocationWithMultipleStrategies(true);
        return; // getLocationWithMultipleStrategies already handles state
      }

      if (location) {
        setLocation(location);
        setError(null);
      }
    } catch (error: any) {
      devDebugger.error('Retry failed:', error);
      setError(error.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  // Get last known location (cached)
  const getLastKnownLocation = async (): Promise<LocationType | null> => {
    if (cachedLocation && Date.now() - cachedLocationTimestamp < 2 * 60 * 60 * 1000) {
      return cachedLocation;
    }
    try {
      const loc = await getCurrentPositionWithOptions({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 2 * 60 * 60 * 1000, // Accept cached location up to 2 hours
      });
      if (loc) {
        cachedLocation = loc;
        cachedLocationTimestamp = Date.now();
      }
      return loc;
    } catch {
      return null;
    }
  };

  // Watch position for continuous updates
  const watchLocation = () => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        if (isValidCoordinate(latitude, longitude)) {
          setLocation({latitude, longitude});
          setError(null);
          setLoading(false);
          devDebugger.log('📍 Location updated:', {latitude, longitude});
        }
      },
      error => {
        devDebugger.error('Watch position error:', error);
        setError('Location tracking failed');
      },
      {
        enableHighAccuracy: false,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000,
      },
    );

    return () => Geolocation.clearWatch(watchId);
  };

  // Calculate Distance Between Coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3;
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const verifyJobGeofence = async (
    job: any,
    actionType: 'clockIn' | 'clockOut',
    onValid: (jobWithLoc: any) => void
  ) => {
    if (actionType === 'clockOut') {
      onValid({ ...job });
      return;
    }

    let currentLocation = location;
    if (!currentLocation) {
      currentLocation = await getLastKnownLocation();
    }
    devDebugger.log('User Location:', currentLocation);
    
    if (!currentLocation) {
      Toast.show({ type: 'error', text2: strings.auth.contractor.home.locationRequired });
      return;
    }

    if (job.latitude && job.longitude) {
      const distanceInMeters = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        job.latitude,
        job.longitude
      );
      devDebugger.log(`Distance to job (${job.title}): ${distanceInMeters.toFixed(2)} meters`);
      
      try {
        await useSystemStore.getState().fetchSettings();
      } catch (error) {
        devDebugger.error('Error fetching latest settings from API, using cached values.', error);
      }
      
      const settings = useSystemStore.getState().settings;
      const geofenceRadius = settings?.geofenceRadius ?? 500;
      const measurementUnit = settings?.measurementUnit ?? 'meters';
      const geofenceRadiusInMeters = convertToMeters(geofenceRadius, measurementUnit);
      
      devDebugger.log(`Geofence Radius: ${geofenceRadiusInMeters} meters (Original: ${geofenceRadius} ${measurementUnit})`);
      if (distanceInMeters <= geofenceRadiusInMeters) {
        onValid({ ...job, userLocation: currentLocation });
      } else {
        Toast.show({ type: 'info', text2: strings.auth.contractor.home.notNearby });
      }
    } else {
      devDebugger.log(`Distance to job (${job.title}): Unknown (Job has no coordinates)`);
      onValid({ ...job, userLocation: currentLocation });
    }
  };

  return {
    location,
    error,
    loading,
    retryLocation,
    watchLocation,
    getLastKnownLocation,
    calculateDistance,
    verifyJobGeofence,
  };
};
