import { useState, useEffect } from 'react';

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
}

export function useGeolocation(): GeolocationState & { requestLocation: () => void } {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
    permissionState: 'unknown',
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported', permissionState: 'denied' }));
      return;
    }
    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      setState(s => ({ ...s, permissionState: result.state as GeolocationState['permissionState'] }));
      if (result.state === 'granted') {
        getLocation();
      }
      result.onchange = () => {
        setState(s => ({ ...s, permissionState: result.state as GeolocationState['permissionState'] }));
      };
    }).catch(() => {
      // Permissions API not available
    });
  }, []);

  function getLocation() {
    setState(s => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
          permissionState: 'granted',
        });
      },
      (err) => {
        setState(s => ({
          ...s,
          error: err.message,
          loading: false,
          permissionState: err.code === 1 ? 'denied' : 'unknown',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return { ...state, requestLocation: getLocation };
}
