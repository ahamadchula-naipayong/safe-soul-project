'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface AudioTrack {
  id: string;
  title: string;
  seriesTitle?: string;
  chapterNumber?: number;
  partNumber?: number;
  partTitle?: string;
  nextTrack?: AudioTrack;
  audioUrl: string;
  duration?: string;
  coverImage?: string;
}

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  playTrack: (track: AudioTrack) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  seekTo: (timeInSeconds: number) => void;
  setRate: (rate: number) => void;
  setTrackVolume: (vol: number) => void;
  closePlayer: () => void;
}

const R2_AUDIO_BASE = (
  process.env.NEXT_PUBLIC_AUDIO_BASE_URL ||
  'https://pub-f97e75c998b047ada96253d539c8f805.r2.dev'
).replace(/\/+$/, '');

// Strict 1-to-1 mapping of all 10 Deep Ocean Archipelago slugs to R2 audio prefixes
const DEEP_OCEAN_AUDIO_PREFIX_BY_SLUG: Record<string, string> = {
  'safe-from-dunya': 'Island1Dunya',
  'safe-from-haram': 'Island2Haram',
  'safe-from-nafsu': 'Island3Nafsu',
  'safe-for-rizq': 'Island4Rizq',
  'safe-for-hijab': 'Island5Hijab',
  'safe-from-hype': 'Island6Hype',
  'safe-from-fake-idol': 'Island7FakeIdol',
  'safe-from-shirk': 'Island8Shirk',
  'safe-for-shia-being': 'Island9ShiaBeing',
  'safe-for-barzakh': 'Island10Barzakh',
};

// Strict 1-to-1 mapping of all 7 Shallow Waters (Oneshot) slugs to R2 audio files
const ONESHOT_AUDIO_BY_SLUG: Record<string, string> = {
  'safe-from-the-dunya': 'island1-full.mp3',
  'safe-from-shirk': 'island2-full.mp3',
  'safe-from-nafs': 'island3-full.mp3',
  'safe-for-rizq': 'island4-full.mp3',
  'safe-from-hype': 'island5-full.mp3',
  'safe-from-haram': 'island6-full.mp3',
  'safe-for-barzakh': 'island7-full.mp3',
};

export function normalizeAudioUrl(
  rawUrl?: string,
  chapterNumber?: number,
  trackId?: string
): string {
  // 1. If trackId is a Deep Ocean ID like "ocean-safe-from-haram-2" or "deep-safe-from-haram-2",
  //    enforce the exact canonical Deep Ocean R2 MP3 for that archipelago and chapter.
  if (trackId) {
    const deepMatch = trackId.match(/^(?:ocean|deep)-([a-z0-9-]+)-(\d+)$/i);
    if (deepMatch) {
      const archSlug = deepMatch[1].toLowerCase();
      const chNum = parseInt(deepMatch[2], 10) || chapterNumber || 1;
      const prefix = DEEP_OCEAN_AUDIO_PREFIX_BY_SLUG[archSlug];
      if (prefix) {
        return `${R2_AUDIO_BASE}/audio/deep-ocean/${prefix}_0${chNum}_normalized.mp3`;
      }
    }

    const shallowNumMatch = trackId.match(/^(?:oneshot|shallow)-(\d+)(?:-full)?$/i);
    if (shallowNumMatch) {
      const chNum = parseInt(shallowNumMatch[1], 10) || chapterNumber || 1;
      return `${R2_AUDIO_BASE}/audio/oneshot/island${chNum}-full.mp3`;
    }

    for (const [slug, file] of Object.entries(ONESHOT_AUDIO_BY_SLUG)) {
      if (trackId.toLowerCase().includes(slug)) {
        return `${R2_AUDIO_BASE}/audio/oneshot/${file}`;
      }
    }
  }

  // 2. Otherwise normalize rawUrl if provided
  if (rawUrl && rawUrl.trim()) {
    let url = rawUrl.trim();
    const secondHttp = url.indexOf('https://', 8);
    if (secondHttp !== -1) {
      url = url.slice(secondHttp);
    }
    url = url.replace(
      /\/audio\/oneshot\/island(\d+)-part[12]\.mp3/i,
      '/audio/oneshot/island$1-full.mp3'
    );
    if (url.startsWith('/audio/')) {
      return `${R2_AUDIO_BASE}${url}`;
    }
    return url;
  }

  const num = chapterNumber || 1;
  return `${R2_AUDIO_BASE}/audio/oneshot/island${num}-full.mp3`;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.85);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<AudioTrack | null>(null);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
      };

      const handlePlayEvent = () => {
        setIsPlaying(true);
      };

      const handlePauseEvent = () => {
        setIsPlaying(false);
      };

      const handleEnded = () => {
        if (currentTrackRef.current?.nextTrack) {
          const next = currentTrackRef.current.nextTrack;
          const nextUrl = normalizeAudioUrl(next.audioUrl, next.chapterNumber, next.id);
          const nextNormalized = { ...next, audioUrl: nextUrl };
          currentTrackRef.current = nextNormalized;
          setCurrentTrack(nextNormalized);
          audio.pause();
          audio.src = nextUrl;
          audio.load();
          audio.currentTime = 0;
          audio.play().then(() => setIsPlaying(true)).catch(console.error);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('play', handlePlayEvent);
      audio.addEventListener('pause', handlePauseEvent);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('play', handlePlayEvent);
        audio.removeEventListener('pause', handlePauseEvent);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, []);

  const playTrack = (track: AudioTrack) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const normalizedUrl = normalizeAudioUrl(track.audioUrl, track.chapterNumber, track.id);
    const normalizedTrack: AudioTrack = {
      ...track,
      audioUrl: normalizedUrl,
    };

    // Only resume without reloading if the EXACT same canonical audioUrl is already loaded
    if (
      currentTrackRef.current &&
      currentTrackRef.current.audioUrl === normalizedUrl &&
      audio.src === normalizedUrl
    ) {
      currentTrackRef.current = normalizedTrack;
      setCurrentTrack(normalizedTrack);
      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }

    // Stop any previous track cleanly before loading the new chapter's audio
    audio.pause();
    currentTrackRef.current = normalizedTrack;
    setCurrentTrack(normalizedTrack);
    setCurrentTime(0);
    setDuration(0);

    audio.src = normalizedUrl;
    audio.load();
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (!audioRef.current || !currentTrackRef.current) return;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (!audioRef.current.paused) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setRate = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const setTrackVolume = (vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    currentTrackRef.current = null;
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        volume,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        seekTo,
        setRate,
        setTrackVolume,
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
