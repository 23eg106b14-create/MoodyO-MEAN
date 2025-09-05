
'use client';

import { useEffect } from 'react';

type MoodDefinition = {
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
  emoji: string;
  themeClass: string;
};

type Track = {
  title: string;
  artist: string;
  src: string;
  cover: string;
  mood?: string;
  index?: number;
};

type ThemeProviderProps = {
    activePage: string;
    customMoods: Record<string, MoodDefinition>;
    tracks: Record<string, Track[]>;
    nowPlaying: { mood: string; index: number } | null;
    allMoods: Record<string, MoodDefinition>;
};

export function ThemeProvider({ activePage, customMoods, tracks, nowPlaying, allMoods }: ThemeProviderProps) {
  useEffect(() => {
    const moodDef = allMoods[activePage as keyof typeof allMoods];

    // Reset classes and styles on body
    document.body.className = '';
    document.body.style.background = '';
    document.documentElement.style.setProperty('--page-accent', '#60a5fa');
    
    // Reset background image on all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
      const pageEl = p as HTMLElement;
      pageEl.style.setProperty('--bg-image', 'none');
    });

    if (activePage === 'home') {
        document.body.classList.add('home-active');
    } else if (moodDef) {
        document.body.style.background = moodDef.bg;
        document.documentElement.style.setProperty('--page-accent', moodDef.accent);
        
        const activePageElement = document.getElementById(activePage);
        const activePlaylist = tracks[activePage as keyof typeof tracks];
        if (activePageElement && activePlaylist && activePlaylist.length > 0) {
            const currentTrack = nowPlaying && nowPlaying.mood === activePage ? tracks[nowPlaying.mood][nowPlaying.index] : activePlaylist[0];
            activePageElement.style.setProperty('--bg-image', `url(${currentTrack.cover})`);
        }

        let classes = `${activePage}-active `;
        classes += moodDef.themeClass || 'custom-theme-active ';
        if (['happy', 'joyful', 'sad'].includes(activePage) || (customMoods[activePage] && !moodDef.themeClass.includes('depression'))) {
            classes += 'theme-active ';
        }
        document.body.className = classes.trim();
    }
  }, [activePage, customMoods, tracks, nowPlaying, allMoods]);

  return null; // This component does not render anything
}
