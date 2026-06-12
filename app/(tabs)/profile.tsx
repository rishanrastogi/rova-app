import { View, Text, StyleSheet, Switch, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../constants/fonts';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={[s.appName, { color: colors.textPrimary }]}>Rova</Text>
          <View style={[s.badge, { backgroundColor: colors.primary }]}>
            <Text style={s.badgeText}>PROFILE</Text>
          </View>
        </View>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={[s.avatar, { backgroundColor: isDark ? '#1E2A3A' : '#E2E8F0' }]}>
            <Icon name="person.fill" size={40} color={colors.textSecondary} />
          </View>
          <Text style={[s.name, { color: colors.textPrimary }]}>Rider</Text>
          <Text style={[s.sub, { color: colors.textSecondary }]}>Rova Member</Text>
        </View>

        {/* Appearance */}
        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconWrap, { backgroundColor: isDark ? '#1E2A3A' : '#EEF4FF' }]}>
                <Icon name={isDark ? 'moon.fill' : 'sun.max.fill'} size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[s.rowTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
                <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                  {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: 'rgba(0,102,255,0.4)' }}
              thumbColor={isDark ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>
        </View>

        {/* About */}
        <Text style={[s.sectionLabel, { color: colors.textSecondary, marginTop: 12 }]}>ABOUT</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: 'info.circle.fill', label: 'Version', value: '1.0.0' },
            { icon: 'bicycle', label: 'Ebike Mode', value: 'Active' },
          ].map(({ icon, label, value }, i, arr) => (
            <View key={label}>
              <View style={s.row}>
                <View style={s.rowLeft}>
                  <View style={[s.iconWrap, { backgroundColor: isDark ? '#1E2A3A' : '#EEF4FF' }]}>
                    <Icon name={icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={[s.rowTitle, { color: colors.textPrimary }]}>{label}</Text>
                </View>
                <Text style={[s.rowSub, { color: colors.textSecondary }]}>{value}</Text>
              </View>
              {i < arr.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    gap: 8,
  },
  appName: { fontSize: 22, fontFamily: Fonts.extraBold, letterSpacing: -0.5 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: Fonts.extraBold, letterSpacing: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontFamily: Fonts.bold, letterSpacing: -0.4 },
  sub: { fontSize: 14, marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 15, fontFamily: Fonts.semiBold },
  rowSub: { fontSize: 12 },
  divider: { height: 1 },
});
