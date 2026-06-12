import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as NowPlaying from '../modules/expo-now-playing';
import type { NowPlayingInfo } from '../modules/expo-now-playing';

const POLL_MS = 1500;

export function useNowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingInfo | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const available = Platform.OS === 'android' && NowPlaying.isAvailable;

  useEffect(() => {
    if (!available) return;

    const poll = () => {
      setPermissionGranted(NowPlaying.isNotificationAccessGranted());
      setNowPlaying(NowPlaying.getNowPlaying());
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [available]);

  return {
    available,
    permissionGranted,
    nowPlaying,
    requestAccess: NowPlaying.openNotificationAccessSettings,
    play: NowPlaying.play,
    pause: NowPlaying.pause,
    togglePlayPause: NowPlaying.togglePlayPause,
    skipToNext: NowPlaying.skipToNext,
    skipToPrevious: NowPlaying.skipToPrevious,
  };
}
