import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  Vibration,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Icon } from '../Icon';
import { cyclingDefaults } from '../../constants/mockData';
import type { LocationState } from '../../hooks/useLocation';
import { useRide } from '../../context/RideContext';
import { useTheme } from '../../context/ThemeContext';
import type { BLEData } from '../../hooks/useBLE';
import { useWeather } from '../../hooks/useWeather';
import { useNowPlaying } from '../../hooks/useNowPlaying';
import Constants from 'expo-constants';

const canRenderMap =
  Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';
const MapView = canRenderMap ? require('react-native-maps').default : null;
const PROVIDER_DEFAULT = canRenderMap ? require('react-native-maps').PROVIDER_DEFAULT : null;
const PROVIDER_GOOGLE = canRenderMap ? require('react-native-maps').PROVIDER_GOOGLE : null;

export type Widget = { id: string; label: string; icon: string };

interface Props {
  selectedWidgets: Widget[];
  locationState: LocationState;
  bleData?: BLEData;
  screenWidth?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function useLiveClock() {
  const [time, setTime] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(formatClock(new Date())), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatRideTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function useRideTimer() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return formatRideTime(elapsed);
}

// Simulates a real ride's speed: gradual accelerations, cruising, and the odd slow-down.
function useMockSpeed(maxSpeed: number) {
  const [speed, setSpeed] = useState(0);
  const targetRef = useRef(maxSpeed * 0.6);

  useEffect(() => {
    const pickTarget = () => {
      const r = Math.random();
      if (r < 0.15) targetRef.current = Math.random() * 4; // coast toward a near-stop
      else if (r < 0.3) targetRef.current = maxSpeed; // brief push to top speed
      else targetRef.current = maxSpeed * (0.5 + Math.random() * 0.4); // steady cruise
    };
    pickTarget();
    const targetId = setInterval(pickTarget, 4000);
    const tickId = setInterval(() => {
      setSpeed(prev => {
        const diff = targetRef.current - prev;
        const next = prev + diff * 0.15 + (Math.random() - 0.5) * 0.6;
        return Math.max(0, Math.min(maxSpeed, next));
      });
    }, 500);
    return () => {
      clearInterval(targetId);
      clearInterval(tickId);
    };
  }, [maxSpeed]);

  return Math.round(speed);
}

// Variation A palette
const A_BG = '#080A0D';
const A_LINE = 'rgba(255,255,255,0.08)';
const A_DIM = 'rgba(255,255,255,0.42)';
const A_FG = '#F5F7FA';
const A_ACCENT = '#38E1C3';
const A_WARN = '#FFB547';

// Variation C palette
const C_FG = '#FFFFFF';
const C_DIM = 'rgba(255,255,255,0.65)';
const C_DIM2 = 'rgba(255,255,255,0.42)';
const C_ACCENT = '#38BDF8';
const C_WARN = '#FFB547';
const C_GLASS = 'rgba(8, 12, 20, 0.72)';
const C_BORDER = 'rgba(255,255,255,0.13)';

function useHUDColors() {
  const { isDark, colors } = useTheme();
  return {
    fg: isDark ? C_FG : '#0A0A0F',
    dim: isDark ? C_DIM : 'rgba(0,0,0,0.55)',
    dim2: isDark ? C_DIM2 : 'rgba(0,0,0,0.40)',
    accent: isDark ? C_ACCENT : colors.accent,
    glass: isDark ? C_GLASS : 'rgba(255,255,255,0.88)',
    border: isDark ? C_BORDER : 'rgba(0,0,0,0.08)',
    trackBg: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
  };
}

// ── Speed Arc (SVG) ───────────────────────────────────────────────────────────
function SpeedArc({
  speed = 16,
  max = 20,
  size = 120,
  stroke = 9,
  gradId = 'arcGrad',
}: {
  speed?: number;
  max?: number;
  size?: number;
  stroke?: number;
  gradId?: string;
}) {
  const pct = Math.min(speed / max, 1);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const START = -220;
  const SPAN = 260;
  const totalCirc = 2 * Math.PI * r;
  const arcLen = totalCirc * (SPAN / 360);
  const fillLen = arcLen * pct;

  // Tick marks
  const ticks = Array.from({ length: 7 }).map((_, i) => {
    const t = i / 6;
    const angleDeg = START + SPAN * t;
    const rad = (angleDeg * Math.PI) / 180;
    const r1 = r - stroke / 2 - 3;
    const r2 = r - stroke / 2 - 9;
    return {
      x1: cx + r1 * Math.cos(rad),
      y1: cy + r1 * Math.sin(rad),
      x2: cx + r2 * Math.cos(rad),
      y2: cy + r2 * Math.sin(rad),
    };
  });

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#38E1C3" />
          <Stop offset="100%" stopColor="#5FA8FF" />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#1A222E"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${arcLen} ${totalCirc}`}
        strokeLinecap="round"
        transform={`rotate(${START} ${cx} ${cy})`}
      />
      {/* Fill */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${fillLen} ${totalCirc}`}
        strokeLinecap="round"
        transform={`rotate(${START} ${cx} ${cy})`}
      />
      {/* Ticks */}
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={t.x1} y1={t.y1}
          x2={t.x2} y2={t.y2}
          stroke="#2A3442"
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

// ── Sparkline (battery trend) ─────────────────────────────────────────────────
function Spark({ color = '#7FC9A8', w = 60, h = 18 }: { color?: string; w?: number; h?: number }) {
  const pts = [2, 6, 5, 10, 8, 14, 12, 11, 15, 13, 18, 16, 14, 19];
  const max = Math.max(...pts), min = Math.min(...pts);
  const d = pts
    .map((v, i) => {
      const x = ((i / (pts.length - 1)) * w).toFixed(1);
      const y = (h - ((v - min) / (max - min)) * h).toFixed(1);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
  return (
    <Svg width={w} height={h}>
      <Path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ── Status strip (shared) ─────────────────────────────────────────────────────
function StatusStrip({ dim, fg, accent, line, time, rideTime }: {
  dim: string; fg: string; accent: string; line: string; time: string; rideTime: string;
}) {
  return (
    <View style={[ss.row, { borderBottomColor: line }]}>
      <View style={ss.left}>
        <View style={[ss.dot, { backgroundColor: accent }]} />
        <Text style={[ss.mono, { color: accent }]}>RIDE {rideTime}</Text>
        <Text style={[ss.mono, { color: dim }]}>  GPS · 8 SATS</Text>
      </View>
      <Text style={[ss.mono, { color: dim }]}>{time}</Text>
    </View>
  );
}
const ss = StyleSheet.create({
  row: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  mono: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.8 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// VARIATION A — CLEAN CLUSTER (minimal: speed + battery only)
// ═══════════════════════════════════════════════════════════════════════════════
function LayoutA({ speed, battery, bleConnected, rideTime }: { speed: number; battery: number; bleConnected: boolean; rideTime: string }) {
  const time = useLiveClock();
  return (
    <View style={[aStyles.root]}>
      <StatusStrip dim={A_DIM} fg={A_FG} accent={A_ACCENT} line={A_LINE} time={time} rideTime={rideTime} />
      {bleConnected && (
        <View style={{ position: 'absolute', top: 34, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 10 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: A_ACCENT }} />
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 9, color: A_ACCENT, letterSpacing: 1 }}>BLE</Text>
        </View>
      )}
      <View style={aStyles.hero}>
        {/* Arc */}
        <View style={aStyles.arcWrap}>
          <SpeedArc speed={speed} max={cyclingDefaults.maxSpeed} size={210} stroke={11} gradId="arcA" />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={aStyles.arcCenter}>
              <Text style={aStyles.kmhLabel}>KM/H</Text>
              <Text style={aStyles.speedNum}>{speed}</Text>
            </View>
          </View>
        </View>

        {/* Stats + battery */}
        <View style={aStyles.rightCol}>
          <View style={aStyles.statsRow}>
            {[
              { val: '14', lbl: 'AVG' },
              { val: String(cyclingDefaults.maxSpeed), lbl: 'MAX' },
              { val: '12.4', lbl: 'KM' },
            ].map(({ val, lbl }) => (
              <View key={lbl} style={aStyles.statItem}>
                <Text style={aStyles.statVal}>{val}</Text>
                <Text style={aStyles.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>
          <View style={aStyles.divider} />
          <BatteryCellA battery={battery} />
        </View>
      </View>
    </View>
  );
}

function BatteryCellA({ battery }: { battery: number }) {
  const range = Math.round(battery * 1.1);
  const color = battery > 50 ? A_ACCENT : battery > 20 ? A_WARN : '#FF5C7A';
  return (
    <View>
      <Text style={[aStyles.cellLabel, { marginBottom: 4 }]}>BATTERY</Text>
      <View style={aStyles.battRow}>
        <Text style={[aStyles.battNum, { color }]}>{battery}</Text>
        <Text style={[aStyles.cellLabel, { alignSelf: 'flex-end', marginBottom: 4 }]}>%</Text>
      </View>
      <View style={aStyles.barTrack}>
        <View style={[aStyles.barFill, { width: `${battery}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[aStyles.cellLabel, { marginTop: 6 }]}>{range} KM RANGE</Text>
    </View>
  );
}

const aStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: A_BG,
  },
  hero: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 32,
  },
  arcWrap: {
    width: 210,
    height: 210,
    flexShrink: 0,
  },
  arcCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmhLabel: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 2.4,
    color: A_DIM,
    marginBottom: 2,
  },
  speedNum: {
    color: A_FG,
    fontSize: 84,
    fontWeight: '100',
    lineHeight: 84,
    letterSpacing: -5,
  },
  rightCol: {
    flex: 1,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 28,
  },
  statItem: { gap: 2 },
  statVal: {
    color: A_FG,
    fontSize: 26,
    fontWeight: '300',
  },
  statLbl: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.4,
    color: A_DIM,
  },
  divider: {
    height: 1,
    backgroundColor: A_LINE,
  },
  cellLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.8,
    color: A_DIM,
    textTransform: 'uppercase',
  },
  battRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  battNum: {
    fontSize: 28,
    fontWeight: '300',
  },
  barTrack: {
    height: 3,
    backgroundColor: A_LINE,
    marginTop: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// VARIATION C — CINEMATIC HUD (all non-minimal modes)
// ═══════════════════════════════════════════════════════════════════════════════

function GlassPanel({
  children,
  style,
  padding = 12,
}: {
  children: React.ReactNode;
  style?: any;
  padding?: number;
}) {
  const { glass, border } = useHUDColors();
  return (
    <View
      style={[
        {
          backgroundColor: glass,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: border,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Pill({ children, accent = C_FG }: { children: React.ReactNode; accent?: string }) {
  const { glass, border } = useHUDColors();
  return (
    <View style={[pillSt.root, { backgroundColor: glass, borderColor: border }]}>
      <Text style={[pillSt.text, { color: accent }]}>{children}</Text>
    </View>
  );
}
const pillSt = StyleSheet.create({
  root: {
    backgroundColor: C_GLASS,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
});

function SpeedHUDC({ speed, fromBle }: { speed: number; fromBle?: boolean }) {
  const { fg, dim2 } = useHUDColors();
  return (
    <GlassPanel style={cStyles.speedHUD} padding={14}>
      <View style={cStyles.speedHUDInner}>
        <View style={{ width: 90, height: 90 }}>
          <SpeedArc speed={speed} max={cyclingDefaults.maxSpeed} size={90} stroke={7} gradId="arcC" />
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[cStyles.hudKmh, { color: dim2 }]}>KM/H</Text>
            <Text style={[cStyles.hudSpeed, { color: fg }]}>{speed}</Text>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <View>
            <Text style={[cStyles.hudStatLbl, { color: dim2 }]}>AVG</Text>
            <Text style={[cStyles.hudStatVal, { color: fg }]}>14</Text>
          </View>
          <View>
            <Text style={[cStyles.hudStatLbl, { color: dim2 }]}>MAX</Text>
            <Text style={[cStyles.hudStatVal, { color: fg }]}>{cyclingDefaults.maxSpeed}</Text>
          </View>
        </View>
      </View>
    </GlassPanel>
  );
}

function BatteryHUDC({ battery }: { battery: number }) {
  const range = Math.round(battery * 1.1);
  const { fg, dim2, accent, trackBg } = useHUDColors();
  return (
    <GlassPanel padding={12} style={cStyles.battHUD}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[cStyles.hudLabel, { color: dim2 }]}>BATTERY</Text>
        <Icon name="bolt.fill" size={11} color={accent} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text style={[cStyles.battNum, { color: fg }]}>{battery}</Text>
        <Text style={[cStyles.hudLabel, { color: dim2 }]}>%</Text>
        <Text style={[cStyles.hudLabel, { marginLeft: 'auto' as any, color: dim2 }]}>{range} km</Text>
      </View>
      <View style={[cStyles.battTrack, { backgroundColor: trackBg }]}>
        <View style={[cStyles.battFill, { width: `${battery}%` as any, backgroundColor: accent }]} />
      </View>
    </GlassPanel>
  );
}

function WeatherHUDC({ weather }: { weather: any }) {
  const { fg, dim2 } = useHUDColors();
  return (
    <GlassPanel padding={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={weather?.sfSymbol ?? 'sun.max.fill'} size={20} color="#FFB547" />
      <View>
        <Text style={[cStyles.hudStatVal, { fontSize: 18, color: fg }]}>{weather?.temperature ?? 22}°</Text>
        <Text style={[cStyles.hudLabel, { color: dim2 }]}>{weather?.windSpeed ?? 12} km/h</Text>
      </View>
    </GlassPanel>
  );
}

function MusicHUDC({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  const { fg, dim2 } = useHUDColors();
  const { available, permissionGranted, nowPlaying, requestAccess, togglePlayPause, skipToNext, skipToPrevious } = useNowPlaying();

  // Android + notification access granted, but nothing is currently playing on the device.
  if (available && permissionGranted && !nowPlaying) {
    return (
      <GlassPanel padding={12} style={cStyles.musicHUD}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          <View style={cStyles.albumArt}>
            <Icon name="music.note" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[cStyles.songTitle, { color: fg }]} numberOfLines={1}>Nothing playing</Text>
            <Text style={[cStyles.hudLabel, { color: dim2 }]} numberOfLines={1}>Start music on your phone</Text>
          </View>
        </View>
      </GlassPanel>
    );
  }

  // Android, but the user hasn't granted access to read the system media session yet.
  if (available && !permissionGranted) {
    return (
      <TouchableOpacity onPress={requestAccess}>
        <GlassPanel padding={12} style={cStyles.musicHUD}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <View style={cStyles.albumArt}>
              <Icon name="music.note" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[cStyles.songTitle, { color: fg }]} numberOfLines={1}>Now Playing</Text>
              <Text style={[cStyles.hudLabel, { color: dim2 }]} numberOfLines={1}>Tap to allow media access</Text>
            </View>
          </View>
        </GlassPanel>
      </TouchableOpacity>
    );
  }

  // Real now-playing info from the device's active media session.
  if (available && nowPlaying) {
    return (
      <GlassPanel padding={12} style={cStyles.musicHUD}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          {nowPlaying.artwork ? (
            <Image source={{ uri: nowPlaying.artwork }} style={cStyles.albumArt} />
          ) : (
            <View style={cStyles.albumArt}>
              <Icon name="music.note" size={18} color="#fff" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[cStyles.songTitle, { color: fg }]} numberOfLines={1}>
              {nowPlaying.title ?? 'Unknown title'}
            </Text>
            <Text style={[cStyles.hudLabel, { color: dim2 }]} numberOfLines={1}>
              {nowPlaying.artist ?? ''}
            </Text>
          </View>
          <TouchableOpacity onPress={skipToPrevious} style={cStyles.musicCtrlBtn}>
            <Icon name="backward.fill" size={20} color={dim2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayPause} style={cStyles.musicCtrlBtn}>
            <Icon
              name={nowPlaying.isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
              size={32}
              color={fg}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext} style={cStyles.musicCtrlBtn}>
            <Icon name="forward.fill" size={20} color={dim2} />
          </TouchableOpacity>
        </View>
      </GlassPanel>
    );
  }

  // Fallback (iOS / web): mock track with a local play/pause toggle.
  return (
    <GlassPanel padding={12} style={cStyles.musicHUD}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
        <View style={cStyles.albumArt}>
          <Icon name="music.note" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cStyles.songTitle, { color: fg }]} numberOfLines={1}>
            {cyclingDefaults.currentSong.split(' - ')[0]}
          </Text>
          <Text style={[cStyles.hudLabel, { color: dim2 }]}>
            {cyclingDefaults.currentSong.split(' - ')[1]}
          </Text>
        </View>
        <TouchableOpacity onPress={onToggle} style={cStyles.musicCtrlBtn}>
          <Icon
            name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
            size={32}
            color={fg}
          />
        </TouchableOpacity>
      </View>
    </GlassPanel>
  );
}

function HydrationHUDC() {
  const { fg, dim2 } = useHUDColors();
  return (
    <GlassPanel padding={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name="drop.fill" size={16} color="#7CB8FF" />
      <View>
        <Text style={[cStyles.songTitle, { fontSize: 12, color: fg }]}>Sip in 4 min</Text>
        <Text style={[cStyles.hudLabel, { color: dim2 }]}>4 / 8 today</Text>
      </View>
    </GlassPanel>
  );
}

function CalHUDC() {
  const { fg, dim2 } = useHUDColors();
  return (
    <GlassPanel padding={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name="calendar" size={14} color={dim2} />
      <View>
        <Text style={[cStyles.songTitle, { fontSize: 12, color: fg }]}>Standup · 16:00</Text>
        <Text style={[cStyles.hudLabel, { color: dim2 }]}>in 28 min</Text>
      </View>
    </GlassPanel>
  );
}

function ProximityHUDC({ alert }: { alert: boolean }) {
  const { glass, border, accent } = useHUDColors();
  return (
    <View style={[pillSt.root, { backgroundColor: glass, borderColor: alert ? 'rgba(255,59,92,0.5)' : border }]}>
      <Icon
        name={alert ? 'exclamationmark.triangle.fill' : 'checkmark.shield'}
        size={12}
        color={alert ? '#FF5C7A' : accent}
      />
      <Text style={[pillSt.text, { color: alert ? '#FF5C7A' : accent }]}>
        {alert ? 'OBJECT NEAR' : 'CLEAR · 360°'}
      </Text>
    </View>
  );
}

// Directional red glow that flashes in from whichever edge a vehicle approaches from.
const PROXIMITY_SIDES = ['top', 'bottom', 'left', 'right'] as const;
type ProximitySide = (typeof PROXIMITY_SIDES)[number];

function ProximityFlash({ side, opacity }: { side: ProximitySide; opacity: Animated.Value }) {
  const gradientCoords =
    side === 'top' ? { x1: '0', y1: '0', x2: '0', y2: '1' }
    : side === 'bottom' ? { x1: '0', y1: '1', x2: '0', y2: '0' }
    : side === 'left' ? { x1: '0', y1: '0', x2: '1', y2: '0' }
    : { x1: '1', y1: '0', x2: '0', y2: '0' };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="proximityFlash" {...gradientCoords}>
            <Stop offset="0" stopColor="#FF1744" stopOpacity={0.85} />
            <Stop offset="0.6" stopColor="#FF1744" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#proximityFlash)" />
      </Svg>
    </Animated.View>
  );
}

function CameraFeedC({
  permission,
  onRequestPermission,
}: {
  permission: ReturnType<typeof useCameraPermissions>[0];
  onRequestPermission: () => void;
}) {
  if (permission?.granted) {
    return <CameraView style={StyleSheet.absoluteFill} facing="back" />;
  }
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#060C14' }]}>
      <Icon name="camera.fill" size={32} color="rgba(255,255,255,0.2)" />
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 10, textAlign: 'center', paddingHorizontal: 32 }}>
        Camera access is needed for the rear-view feed
      </Text>
      <TouchableOpacity
        onPress={onRequestPermission}
        style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <Text style={{ color: '#4AF3D0', fontSize: 13, fontWeight: '600' }}>Grant camera access</Text>
      </TouchableOpacity>
    </View>
  );
}

function SpeedHeroBgC() {
  return (
    <View style={[StyleSheet.absoluteFill, cStyles.speedBg]}>
      <View style={cStyles.speedBgGlow} />
    </View>
  );
}

function MapHeroC({ location }: { location: any }) {
  const mapRef = useRef<any>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }, 800);
    }
  }, [location]);

  if (!location) {
    return (
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A2E' }]}>
        <ActivityIndicator color={C_ACCENT} />
      </View>
    );
  }
  if (!canRenderMap) {
    return (
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A2E' }]}>
        <Text style={{ color: C_DIM, fontSize: 13 }}>Map needs a dev build</Text>
      </View>
    );
  }
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      pitchEnabled={false}
      rotateEnabled={false}
      customMapStyle={isDark ? slateDarkMapStyle : lightMapStyle}
    />
  );
}

function LayoutC({
  ids,
  locationState,
  speed,
  battery,
  bleConnected,
  rideTime,
}: {
  ids: Set<string>;
  locationState: LocationState;
  speed: number;
  battery: number;
  bleConnected: boolean;
  rideTime: string;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [proximityAlert, setProximityAlert] = useState(false);
  const [flashSide, setFlashSide] = useState<ProximitySide>('left');
  const alertShake = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const alertActiveRef = useRef(false);
  const time = useLiveClock();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const weather = useWeather(locationState.location);
  const { fg, dim, dim2, accent, glass, border } = useHUDColors();

  const has = (id: string) => ids.has(id);
  const bg = has('map') ? 'map' : has('camera') ? 'camera' : 'speed';

  const triggerProximityAlert = () => {
    if (alertActiveRef.current) return;
    alertActiveRef.current = true;
    setProximityAlert(true);
    setFlashSide(PROXIMITY_SIDES[Math.floor(Math.random() * PROXIMITY_SIDES.length)]);
    Vibration.vibrate([0, 200, 100, 200]);
    Animated.sequence([
      Animated.timing(alertShake, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setProximityAlert(false);
      alertActiveRef.current = false;
    }, 1500);
  };

  return (
    <Animated.View
      style={[
        cStyles.root,
        { transform: [{ translateX: alertShake }] },
      ]}
    >
      {/* ── Full-bleed background ── */}
      {bg === 'map' && <MapHeroC location={locationState.location} />}
      {bg === 'camera' && (
        <CameraFeedC permission={cameraPermission} onRequestPermission={requestCameraPermission} />
      )}
      {bg === 'speed' && <SpeedHeroBgC />}

      {/* ── Vignette ── */}
      <View style={cStyles.vignette} pointerEvents="none" />

      {/* ── Proximity flash ── */}
      <ProximityFlash side={flashSide} opacity={flashOpacity} />

      {/* ── Top bar ── */}
      <View style={cStyles.topBar}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={[pillSt.root, { backgroundColor: glass, borderColor: border }]}>
            <View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent, marginRight: 6 }]} />
            <Text style={[pillSt.text, { color: accent }]}>RIDE · {rideTime}</Text>
          </View>
          <View style={[pillSt.root, { backgroundColor: glass, borderColor: bleConnected ? 'rgba(74,243,208,0.4)' : border }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: bleConnected ? accent : '#555', marginRight: 6 }} />
            <Text style={[pillSt.text, { color: bleConnected ? accent : dim2 }]}>BLE</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {has('weather') && weather && <WeatherHUDC weather={weather} />}
          {has('proximity') && <ProximityHUDC alert={proximityAlert} />}
          <View style={[pillSt.root, { backgroundColor: glass, borderColor: border }]}>
            <Text style={[pillSt.text, { color: dim }]}>{time}</Text>
          </View>
        </View>
      </View>

      {/* ── Speed hero (when no map/camera) ── */}
      {bg === 'speed' && (
        <View style={cStyles.speedHeroCenter}>
          <View style={{ width: 260, height: 260 }}>
            <SpeedArc
              speed={speed}
              max={cyclingDefaults.maxSpeed}
              size={260}
              stroke={14}
              gradId="arcCHero"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Text style={cStyles.heroKmh}>KM/H</Text>
              <Text style={cStyles.heroSpeed}>{speed}</Text>
            </View>
          </View>
          <View style={{ gap: 14, marginLeft: 12 }}>
            {[
              { lbl: 'AVG', val: '14' },
              { lbl: 'MAX', val: String(cyclingDefaults.maxSpeed) },
              { lbl: 'TRIP', val: '12.4 km' },
            ].map(({ lbl, val }) => (
              <View key={lbl}>
                <Text style={cStyles.heroStatLbl}>{lbl}</Text>
                <Text style={cStyles.heroStatVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Camera live tag ── */}
      {bg === 'camera' && cameraPermission?.granted && (
        <View style={cStyles.camTag}>
          <View style={[pillSt.root, { borderColor: 'rgba(255,59,92,0.5)' }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B5C', marginRight: 6 }} />
            <Text style={[pillSt.text, { color: C_FG }]}>REAR CAM · LIVE</Text>
          </View>
        </View>
      )}

      {/* ── Bottom-left: speed + battery ── */}
      {bg !== 'speed' && (
        <View style={cStyles.bottomLeft}>
          <SpeedHUDC speed={speed} fromBle={bleConnected} />
          <BatteryHUDC battery={battery} />
        </View>
      )}

      {/* When speed is hero, battery sits bottom-left */}
      {bg === 'speed' && (
        <View style={cStyles.bottomLeft}>
          <BatteryHUDC battery={battery} />
        </View>
      )}

      {/* ── Bottom-right: secondary widgets ── */}
      <View style={cStyles.bottomRight}>
        {has('calendar') && <CalHUDC />}
        {has('hydration') && <HydrationHUDC />}
        {has('music') && <MusicHUDC isPlaying={isPlaying} onToggle={() => setIsPlaying(p => !p)} />}
        {has('proximity') && !has('weather') && (
          <TouchableOpacity onPress={triggerProximityAlert}>
            <GlassPanel padding={10}>
              <Text style={{ color: '#FF5C7A', fontSize: 11, fontWeight: '600' }}>
                Test Alert
              </Text>
            </GlassPanel>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const cStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050709',
  },
  speedBg: {
    backgroundColor: '#0A0D14',
  },
  speedBgGlow: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: '45%',
    height: '80%',
    borderRadius: 999,
    backgroundColor: 'rgba(74,243,208,0.07)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // top and bottom dark gradients simulated via pointerEvents none
  },
  topBar: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  // Speed HUD
  speedHUD: {
    minWidth: 200,
  },
  speedHUDInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hudKmh: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1.5,
    color: C_DIM2,
    marginBottom: 2,
  },
  hudSpeed: {
    color: C_FG,
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: -1.5,
    lineHeight: 30,
  },
  hudStatLbl: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.4,
    color: C_DIM2,
  },
  hudStatVal: {
    color: C_FG,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 20,
  },
  hudLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1,
    color: C_DIM2,
  },
  // Battery HUD
  battHUD: {
    minWidth: 170,
  },
  battNum: {
    color: C_FG,
    fontSize: 26,
    fontWeight: '300',
  },
  battTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  battFill: {
    height: '100%',
    backgroundColor: C_ACCENT,
    borderRadius: 2,
  },
  // Music HUD
  musicHUD: {
    minWidth: 230,
  },
  albumArt: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicCtrlBtn: {
    padding: 4,
  },
  songTitle: {
    color: C_FG,
    fontSize: 13,
    fontWeight: '600',
  },
  // Speed hero center
  speedHeroCenter: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  heroKmh: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 2.4,
    color: C_DIM2,
    marginBottom: 2,
  },
  heroSpeed: {
    color: C_FG,
    fontSize: 110,
    fontWeight: '100',
    lineHeight: 100,
    letterSpacing: -7,
  },
  heroStatLbl: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1.8,
    color: C_DIM2,
  },
  heroStatVal: {
    color: C_FG,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  // Camera tag
  camTag: {
    position: 'absolute',
    top: 50,
    left: 12,
    zIndex: 10,
  },
  // Floating widget positions
  bottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    gap: 8,
    zIndex: 10,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 8,
    alignItems: 'flex-end',
    zIndex: 10,
  },
});

// ── Dark map style ────────────────────────────────────────────────────────────
const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F5F7FA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#0EA5E9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E2E8F0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E2E8F0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#CBD5E1' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#BAE6FD' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0EA5E9' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F5F7FA' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const slateDarkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1C1C1E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#00CFFF' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1C1C1E' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1E3A5F' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#152D4A' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2A4E80' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1E3A5F' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1E3A5F' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A0F1A' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#00CFFF' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1C1C1E' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2A2A2E' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#00CFFF' }] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Main export — decides which layout to render
// ═══════════════════════════════════════════════════════════════════════════════
export default function CyclingDashboard({ selectedWidgets, locationState, bleData }: Props) {
  const ids = new Set(selectedWidgets.map(w => w.id));
  const rideContext = useRide();
  const rideTime = useRideTimer();

  const bleConnected = bleData?.connected ?? false;
  const mockSpeed = useMockSpeed(cyclingDefaults.maxSpeed);
  const speed = bleConnected ? (bleData?.speed ?? rideContext.speed) : mockSpeed;
  const battery = bleData?.battery ?? rideContext.battery ?? cyclingDefaults.battery;

  // Variation A: minimal (only speed + battery selected, nothing else)
  const isMinimal =
    ids.has('speed') &&
    ids.has('battery') &&
    !ids.has('map') &&
    !ids.has('camera') &&
    !ids.has('music') &&
    !ids.has('weather') &&
    !ids.has('hydration') &&
    !ids.has('calendar') &&
    !ids.has('proximity');

  if (selectedWidgets.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: A_BG, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ color: A_DIM, fontSize: 16, fontWeight: '600' }}>No widgets selected</Text>
        <Text style={{ color: A_DIM, fontSize: 13, opacity: 0.7 }}>Switch to gallery to pick some</Text>
      </View>
    );
  }

  if (isMinimal) return <LayoutA speed={speed} battery={battery} bleConnected={bleConnected} rideTime={rideTime} />;
  return <LayoutC ids={ids} locationState={locationState} speed={speed} battery={battery} bleConnected={bleConnected} rideTime={rideTime} />;
}
