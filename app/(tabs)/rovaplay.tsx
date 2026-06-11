import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Icon } from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import CyclingDashboard from '../../components/rovaplay/CyclingDashboard';
import WidgetGrid from '../../components/rovaplay/WidgetGrid';
import { useLocation } from '../../hooks/useLocation';
import { useBLE } from '../../hooks/useBLE';
import { useRide } from '../../context/RideContext';
import { widgets as allWidgets } from '../../constants/mockData';

export default function RovaPlayScreen() {
  const [activeWidgets, setActiveWidgets] = useState<Set<string>>(
    new Set(['speed', 'battery', 'map', 'music'])
  );
  const [isLandscape, setIsLandscape] = useState(false);

  const { colors } = useTheme();
  const locationState = useLocation();
  const bleData = useBLE();
  const { setBattery, setSpeed, setBleConnected } = useRide();
  const { width, height } = useWindowDimensions();

  React.useEffect(() => {
    if (bleData.battery != null) setBattery(bleData.battery);
    if (bleData.speed != null) setSpeed(bleData.speed);
    setBleConnected(bleData.connected);
  }, [bleData.battery, bleData.speed, bleData.connected]);

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    const sync = async () => {
      const o = await ScreenOrientation.getOrientationAsync();
      setIsLandscape(
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    };
    sync();
    const sub = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      setIsLandscape(
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    });
    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, []);

  const effectiveLandscape = isLandscape || width > height;
  const selectedWidgets = allWidgets.filter(w => activeWidgets.has(w.id));

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (effectiveLandscape) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050709' }}>
        <CyclingDashboard
          selectedWidgets={selectedWidgets}
          locationState={locationState}
          bleData={bleData}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 8, paddingBottom: 12, gap: 8 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>Rova</Text>
        <View style={{ backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>PLAY</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: '800', letterSpacing: -0.8, lineHeight: 38, marginBottom: 8 }}>Widgets</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24 }}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{activeWidgets.size}</Text>
          {` of ${allWidgets.length} selected · arranges automatically`}
        </Text>

        <WidgetGrid activeWidgets={activeWidgets} onToggle={toggleWidget} widgets={allWidgets} />

        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }}>
            <Icon name="bicycle" size={14} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', letterSpacing: 0.2 }}>Rotate to ride</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
