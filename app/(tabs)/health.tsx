import React from 'react';
import { View, Text, StyleSheet, Switch, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useReminders } from '../../context/RemindersContext';
import { Fonts } from '../../constants/fonts';

const WATER_INTERVALS = [30, 45, 60, 90];
const BREAK_INTERVALS = [15, 30, 45, 60];

function formatRemaining(ms: number): string {
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin <= 0) return 'due now';
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function HealthScreen() {
  const { colors, isDark } = useTheme();
  const {
    water, breaks, waterCount, waterGoal, waterRemainingMs, breaksRemainingMs,
    setWaterEnabled, setWaterInterval, setBreaksEnabled, setBreaksInterval,
    logWater, takeBreak,
  } = useReminders();

  const waterPct = Math.min(1, waterCount / waterGoal);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.headerRow}>
          <Text style={[s.appName, { color: colors.textPrimary }]}>Rova</Text>
          <View style={[s.badge, { backgroundColor: colors.primary }]}>
            <Text style={s.badgeText}>HEALTH</Text>
          </View>
        </View>

        {/* Hydration progress */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconWrap, { backgroundColor: isDark ? '#1E2A3A' : '#EEF4FF' }]}>
                <Icon name="drop.fill" size={16} color={colors.accent} />
              </View>
              <View>
                <Text style={[s.rowTitle, { color: colors.textPrimary }]}>Today's Water</Text>
                <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                  {waterCount} / {waterGoal} glasses
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={logWater}
              style={[s.logBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Icon name="bolt.fill" size={13} color="#fff" />
              <Text style={s.logBtnText}>Log glass</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}>
            <View style={[s.progressFill, { width: `${waterPct * 100}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Water reminders */}
        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>WATER REMINDERS</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconWrap, { backgroundColor: isDark ? '#1E2A3A' : '#EEF4FF' }]}>
                <Icon name="drop.fill" size={16} color={colors.accent} />
              </View>
              <View>
                <Text style={[s.rowTitle, { color: colors.textPrimary }]}>Hydration reminders</Text>
                <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                  {water.enabled ? `Next in ${formatRemaining(waterRemainingMs)}` : 'Off'}
                </Text>
              </View>
            </View>
            <Switch
              value={water.enabled}
              onValueChange={setWaterEnabled}
              trackColor={{ false: '#D1D5DB', true: 'rgba(0,102,255,0.4)' }}
              thumbColor={water.enabled ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {water.enabled && (
            <>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <Text style={[s.intervalLabel, { color: colors.textSecondary }]}>REMIND ME EVERY</Text>
              <View style={s.chipsRow}>
                {WATER_INTERVALS.map(mins => {
                  const active = water.intervalMinutes === mins;
                  return (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => setWaterInterval(mins)}
                      style={[
                        s.chip,
                        {
                          backgroundColor: active ? colors.primary : (isDark ? '#1E2A3A' : '#EEF4FF'),
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[s.chipText, { color: active ? '#fff' : colors.textPrimary }]}>{mins}m</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Break reminders */}
        <Text style={[s.sectionLabel, { color: colors.textSecondary, marginTop: 12 }]}>BREAK REMINDERS</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconWrap, { backgroundColor: isDark ? '#1E2A3A' : '#EEF4FF' }]}>
                <Icon name="figure.walk" size={16} color={colors.warning} />
              </View>
              <View>
                <Text style={[s.rowTitle, { color: colors.textPrimary }]}>Rest break reminders</Text>
                <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                  {breaks.enabled ? `Next in ${formatRemaining(breaksRemainingMs)}` : 'Off'}
                </Text>
              </View>
            </View>
            <Switch
              value={breaks.enabled}
              onValueChange={setBreaksEnabled}
              trackColor={{ false: '#D1D5DB', true: 'rgba(0,102,255,0.4)' }}
              thumbColor={breaks.enabled ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {breaks.enabled && (
            <>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <Text style={[s.intervalLabel, { color: colors.textSecondary }]}>REMIND ME EVERY</Text>
              <View style={s.chipsRow}>
                {BREAK_INTERVALS.map(mins => {
                  const active = breaks.intervalMinutes === mins;
                  return (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => setBreaksInterval(mins)}
                      style={[
                        s.chip,
                        {
                          backgroundColor: active ? colors.primary : (isDark ? '#1E2A3A' : '#EEF4FF'),
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[s.chipText, { color: active ? '#fff' : colors.textPrimary }]}>{mins}m</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity onPress={takeBreak} style={s.row} activeOpacity={0.7}>
                <Text style={[s.rowTitle, { color: colors.primary }]}>I just took a break</Text>
                <Icon name="chevron.right" size={14} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
    gap: 8,
  },
  appName: {
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    letterSpacing: -0.5,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Fonts.extraBold,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  logBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  intervalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
});
