import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';
import { useReminders } from '../context/RemindersContext';
import { Fonts } from '../constants/fonts';

function Banner({
  icon,
  iconColor,
  title,
  message,
  primaryLabel,
  onPrimary,
  onSnooze,
}: {
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  onSnooze: () => void;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[s.banner, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
      <View style={[s.iconWrap, { backgroundColor: isDark ? '#1E2A3A' : '#EEF4FF' }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[s.message, { color: colors.textSecondary }]}>{message}</Text>
      </View>
      <View style={{ gap: 6, alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={onPrimary} style={[s.primaryBtn, { backgroundColor: colors.primary }]}>
          <Text style={s.primaryBtnText}>{primaryLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSnooze}>
          <Text style={[s.snoozeText, { color: colors.textSecondary }]}>Snooze 10m</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ReminderBanner() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { waterDue, breaksDue, logWater, snoozeWater, takeBreak, snoozeBreak } = useReminders();

  if (!waterDue && !breaksDue) return null;

  return (
    <View style={[s.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      {breaksDue && (
        <Banner
          icon="figure.walk"
          iconColor={colors.warning}
          title="Time for a break"
          message="You've been riding for a while — stretch your legs."
          primaryLabel="Took a break"
          onPrimary={takeBreak}
          onSnooze={() => snoozeBreak(10)}
        />
      )}
      {waterDue && (
        <Banner
          icon="drop.fill"
          iconColor={colors.accent}
          title="Stay hydrated"
          message="It's been a while since your last water reminder."
          primaryLabel="Log water"
          onPrimary={logWater}
          onSnooze={() => snoozeWater(10)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
  message: {
    fontSize: 11,
    marginTop: 2,
  },
  primaryBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  snoozeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
});
