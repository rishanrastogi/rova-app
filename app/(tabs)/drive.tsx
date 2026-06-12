import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { useRide } from '../../context/RideContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../constants/fonts';

const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

const recentRides = [
  { id: '1', date: 'Today',      distance: 14.2, avgSpeed: 18, duration: '38m' },
  { id: '2', date: 'Yesterday',  distance: 28.7, avgSpeed: 19, duration: '1h 6m' },
  { id: '3', date: 'Mon 12 May', distance: 9.4,  avgSpeed: 17, duration: '29m' },
  { id: '4', date: 'Sat 10 May', distance: 42.1, avgSpeed: 19, duration: '1h 45m' },
];

export default function DriveScreen() {
  const [locked, setLocked] = useState(false);
  const { battery } = useRide();
  const { colors, isDark } = useTheme();
  const range = Math.round(battery * 1.1);

  const batteryColor = battery > 50 ? colors.success : battery > 20 ? colors.warning : colors.danger;
  const batterySegments = Math.round(battery / 10);

  const card = { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 16 : 8, paddingBottom: 12, gap: 8 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: Fonts.extraBold, letterSpacing: -0.5 }}>Rova</Text>
          <View style={{ backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: '#fff', fontSize: 9, fontFamily: Fonts.extraBold, letterSpacing: 1 }}>DRIVE</Text>
          </View>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.semiBold, letterSpacing: 1.5, marginBottom: 12 }}>YOUR EBIKE</Text>

        {/* Battery + Range row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 0 }}>
          <View style={[card, { flex: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Icon name="bolt.fill" size={13} color={batteryColor} />
              <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: colors.textSecondary }}>BATTERY</Text>
            </View>
            <Text style={{ fontSize: 38, fontFamily: Fonts.extraLight, letterSpacing: -1, lineHeight: 40, color: batteryColor }}>
              {battery}<Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: colors.textSecondary }}>%</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 3, marginTop: 10 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < batterySegments ? batteryColor : colors.border }} />
              ))}
            </View>
          </View>

          <View style={[card, { flex: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Icon name="map.fill" size={13} color={colors.accent} />
              <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: colors.textSecondary }}>RANGE</Text>
            </View>
            <Text style={{ fontSize: 38, fontFamily: Fonts.extraLight, letterSpacing: -1, lineHeight: 40, color: colors.textPrimary }}>
              {range}<Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: colors.textSecondary }}> km</Text>
            </Text>
            <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${battery}%` as any, backgroundColor: colors.accent, borderRadius: 2 }} />
            </View>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: colors.textSecondary, marginTop: 6, letterSpacing: 0.5 }}>Distance remaining</Text>
          </View>
        </View>

        {/* Bluetooth Lock */}
        <View style={card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: locked ? isDark ? 'rgba(255,92,122,0.15)' : 'rgba(220,38,38,0.10)' : isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.10)' }}>
                <Icon name={locked ? 'lock.fill' : 'lock.open.fill'} size={20} color={locked ? colors.danger : colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.semiBold, marginBottom: 3 }}>Bluetooth Lock</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {locked ? 'Converter locked · motor disabled' : 'Converter unlocked · ready to ride'}
                </Text>
              </View>
            </View>
            <Switch
              value={locked}
              onValueChange={setLocked}
              trackColor={{ false: colors.border, true: isDark ? 'rgba(255,92,122,0.4)' : 'rgba(220,38,38,0.35)' }}
              thumbColor={locked ? colors.danger : colors.success}
              ios_backgroundColor={colors.border}
            />
          </View>
          {locked && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: isDark ? 'rgba(255,92,122,0.08)' : 'rgba(220,38,38,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }}>
              <Icon name="exclamationmark.triangle.fill" size={11} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 12, fontFamily: Fonts.medium }}>Motor is disabled. Unlock to ride.</Text>
            </View>
          )}
        </View>

        {/* Recent Rides */}
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.semiBold, letterSpacing: 1.5, marginBottom: 12, marginTop: 12 }}>RECENT RIDES</Text>
        <View style={card}>
          {recentRides.map((ride, index) => (
            <View key={ride.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
                  <View>
                    <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.semiBold, marginBottom: 2 }}>{ride.date}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{ride.duration}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontFamily: Fonts.light, letterSpacing: -0.5 }}>
                    {ride.distance} <Text style={{ fontSize: 12, color: colors.textSecondary }}>km</Text>
                  </Text>
                  <Text style={{ fontFamily: MONO, fontSize: 10, color: colors.textSecondary, marginTop: 2, letterSpacing: 0.3 }}>avg {ride.avgSpeed} km/h</Text>
                </View>
              </View>
              {index < recentRides.length - 1 && <View style={{ height: 1, backgroundColor: colors.border }} />}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
