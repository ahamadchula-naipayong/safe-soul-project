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
      audioRef.current = new Audio();
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
      };

      const handleEnded = () => {
        if (currentTrackRef.current?.nextTrack) {
          const next = currentTrackRef.current.nextTrack;
          currentTrackRef.current = next;
          setCurrentTrack(next);
          audio.src = next.audioUrl;
          audio.currentTime = 0;
          audio.play().then(() => setIsPlaying(true)).catch(console.error);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, []);

  const playTrack = (track: AudioTrack) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (currentTrack?.id === track.id) {
      if (!isPlaying) {
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
      return;
    }

    currentTrackRef.current = track;
    setCurrentTrack(track);
    audio.src = track.audioUrl;
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
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const togglePlay = () => {
    if (isPlaying) {
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
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
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
