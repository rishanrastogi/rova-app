import { requireOptionalNativeModule } from 'expo-modules-core';

export interface NowPlayingInfo {
  title: string | null;
  artist: string | null;
  album: string | null;
  isPlaying: boolean;
  packageName: string | null;
  artwork: string | null;
}

interface NowPlayingNativeModule {
  isNotificationAccessGranted(): boolean;
  openNotificationAccessSettings(): void;
  getNowPlaying(): NowPlayingInfo | null;
  play(): void;
  pause(): void;
  togglePlayPause(): void;
  skipToNext(): void;
  skipToPrevious(): void;
}

const NowPlaying = requireOptionalNativeModule<NowPlayingNativeModule>('NowPlaying');

export const isAvailable = NowPlaying != null;

export function isNotificationAccessGranted(): boolean {
  return NowPlaying?.isNotificationAccessGranted() ?? false;
}

export function openNotificationAccessSettings(): void {
  NowPlaying?.openNotificationAccessSettings();
}

export function getNowPlaying(): NowPlayingInfo | null {
  return NowPlaying?.getNowPlaying() ?? null;
}

export function play(): void {
  NowPlaying?.play();
}

export function pause(): void {
  NowPlaying?.pause();
}

export function togglePlayPause(): void {
  NowPlaying?.togglePlayPause();
}

export function skipToNext(): void {
  NowPlaying?.skipToNext();
}

export function skipToPrevious(): void {
  NowPlaying?.skipToPrevious();
}
