'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

const UserLocationContext = createContext<UserLocation | null>(null);

export function UserLocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  return <UserLocationContext.Provider value={location}>{children}</UserLocationContext.Provider>;
}

export function useUserLocation() {
  return useContext(UserLocationContext);
}