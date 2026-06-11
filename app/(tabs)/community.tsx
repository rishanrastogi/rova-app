import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { communityFeed, type CommunityRide, type RoutePoint } from '../../constants/communityData';

const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

function RoutePreview({ route, color, bg }: { route: RoutePoint[]; color: string; bg: string }) {
  const d = route.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const start = route[0];
  const end = route[route.length - 1];
  return (
    <View style={[s.routeWrap, { backgroundColor: bg }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
        <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={start.x} cy={start.y} r={3.5} fill={color} />
        <Circle cx={end.x} cy={end.y} r={3.5} fill={color} fillOpacity={0.4} stroke={color} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

function Stat({ label, value, color, dim }: { label: string; value: string; color: string; dim: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={[s.statLabel, { color: dim }]}>{label}</Text>
    </View>
  );
}

function RideCard({ ride }: { ride: CommunityRide }) {
  const { colors, isDark } = useTheme();
  const [liked, setLiked] = useState(false);
  const kudos = ride.kudos + (liked ? 1 : 0);

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: ride.user.color }]}>
          <Text style={s.avatarText}>{ride.user.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.name, { color: colors.textPrimary }]}>{ride.user.name}</Text>
          <Text style={[s.meta, { color: colors.textSecondary }]}>{ride.timeAgo} · {ride.activity}</Text>
        </View>
        <Icon name="bicycle" size={18} color={colors.textSecondary} />
      </View>

      {/* Title */}
      <Text style={[s.title, { color: colors.textPrimary }]}>{ride.title}</Text>

      {/* Route preview */}
      <RoutePreview route={ride.route} color={colors.primary} bg={isDark ? '#0D1520' : '#EEF4FF'} />

      {/* Stats */}
      <View style={[s.statsRow, { borderColor: colors.border }]}>
        <Stat label="DISTANCE" value={`${ride.distance} km`} color={colors.textPrimary} dim={colors.textSecondary} />
        <Stat label="TIME" value={ride.duration} color={colors.textPrimary} dim={colors.textSecondary} />
        <Stat label="AVG SPEED" value={`${ride.avgSpeed} km/h`} color={colors.textPrimary} dim={colors.textSecondary} />
        <Stat label="ELEV GAIN" value={`${ride.elevation} m`} color={colors.textPrimary} dim={colors.textSecondary} />
      </View>

      {/* Actions */}
      <View style={[s.actions, { borderColor: colors.border }]}>
        <TouchableOpacity style={s.actionBtn} onPress={() => setLiked(v => !v)} activeOpacity={0.7}>
          <Icon name="hand.thumbsup.fill" size={17} color={liked ? colors.primary : colors.textSecondary} />
          <Text style={[s.actionText, { color: liked ? colors.primary : colors.textSecondary }]}>
            {kudos} kudos
          </Text>
        </TouchableOpacity>
        <View style={s.actionBtn}>
          <Icon name="bubble.right" size={17} color={colors.textSecondary} />
          <Text style={[s.actionText, { color: colors.textSecondary }]}>{ride.comments} comments</Text>
        </View>
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={[s.appName, { color: colors.textPrimary }]}>Rova</Text>
          <View style={[s.badge, { backgroundColor: colors.primary }]}>
            <Text style={s.badgeText}>COMMUNITY</Text>
          </View>
        </View>

        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>RECENT ACTIVITY</Text>

        {communityFeed.map(ride => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    gap: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
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
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  routeWrap: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
