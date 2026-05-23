import React, { createContext, useContext, useState } from 'react';

interface RideData {
  battery: number;
  range: number;
  speed: number;
  bleConnected: boolean;
  setBattery: (v: number) => void;
  setRange: (v: number) => void;
  setSpeed: (v: number) => void;
  setBleConnected: (v: boolean) => void;
}

const RideContext = createContext<RideData>({
  battery: 50,
  range: 55,
  speed: 0,
  bleConnected: false,
  setBattery: () => {},
  setRange: () => {},
  setSpeed: () => {},
  setBleConnected: () => {},
});

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [battery, setBattery] = useState(50);
  const [range, setRange] = useState(55);
  const [speed, setSpeed] = useState(0);
  const [bleConnected, setBleConnected] = useState(false);

  return (
    <RideContext.Provider value={{ battery, range, speed, bleConnected, setBattery, setRange, setSpeed, setBleConnected }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  return useContext(RideContext);
}
