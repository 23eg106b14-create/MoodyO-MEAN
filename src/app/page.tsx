
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { SkipBack, SkipForward, Play, Pause, X, Heart, Menu, Wand2, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateMood, GenerateMoodInput, GenerateMoodOutput } from '@/ai/flows/mood-generator';


// --- Data Definitions ---
type MoodDefinition = {
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
  emoji: string;
  themeClass: string;
};

const MOOD_DEFS: { [key: string]: MoodDefinition } = {
  happy: {
    title: 'Happy — Vibrant Beats',
    subtitle: 'Feel-good tracks with a deep groove',
    accent: '#FFB347',
    bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
    emoji: '😄',
    themeClass: 'happy-active',
  },
  joyful: {
    title: 'Joyful — Energetic Beats',
    subtitle: 'High-energy songs — perfect for smiles and movement',
    accent: '#FF4081',
    bg: 'linear-gradient(135deg, #FFF0F6 0%, #FF80AB 100%)',
    emoji: '🥳',
    themeClass: 'joyful-active',
  },
  sad: {
    title: 'Sad — Melancholy',
    subtitle: 'Slow, emotional tracks to reflect',
    accent: '#2196F3',
    bg: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
    emoji: '😢',
    themeClass: 'sad-active',
  },
  depression: {
    title: 'Depression — Ambient & Soothing',
    subtitle: 'Ambient textures and slow soundscapes',
    accent: '#5E3370',
    bg: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
    emoji: '😔',
    themeClass: 'depression-active',
  }
};

type Track = {
  title: string;
  artist: string;
  src: string;
  cover: string;
  mood?: string;
  index?: number;
};


const SAMPLE_TRACKS = (baseIdx = 1): Track[] => Array.from({ length: 10 }, (_, i) => ({
  title: ['Sunny Days', 'Golden Hour', 'Sparkle', 'Warm Breeze', 'Lemonade', 'Candy Skies', 'Bloom', 'Brightside', 'Hummingbird', 'Radiant'][i],
  artist: ['MoodyO Mix', 'Acoustic', 'Indie Pop', 'Lo-Fi', 'Electro Pop', 'Indie', 'Bedroom Pop', 'Folk', 'Chillhop', 'Dance'][i],
  src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(baseIdx + i) % 16 + 1}.mp3`,
  cover: `https://picsum.photos/seed/h${baseIdx + i}/600/600`
}));

const STATIC_TRACKS = {
  happy: SAMPLE_TRACKS(0),
  joyful: SAMPLE_TRACKS(4),
  sad: SAMPLE_TRACKS(8),
  depression: SAMPLE_TRACKS(12)
};

const AnimatedText = ({ text, className }: { text: string, className?: string }) => {
  return (
    <div className={cn("word", className)}>
      {text.split("").map((char, index) => (
        <span key={index} className="char" style={{ transitionDelay: `${index * 0.05}s` }}>
          {char}
        </span>
      ))}
    </div>
  );
};

const AnimatedHomeTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <h2 className="home-title">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="home-title-word">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="home-title-char"
              style={{ transitionDelay: `${(wordIndex * 5 + charIndex) * 20}ms` }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
};


export default function Home() {
  const [appVisible, setAppVisible] = useState(false);
  const [activePage, setActivePage] = useState('');
  const [nowPlaying, setNowPlaying] = useState<{ mood: string; index: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [isCustomMoodDialogOpen, setIsCustomMoodDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customMoods, setCustomMoods] = useState<Record<string, MoodDefinition>>({});
  const [tracks, setTracks] = useState<Record<string, Track[]>>(STATIC_TRACKS);
  const [customMoodFormData, setCustomMoodFormData] = useState({ name: '', emoji: '', description: '' });


  const audioRef = useRef<HTMLAudioElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);


  // Custom Cursor Logic
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power3.out'
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    const addHover = () => cursor.classList.add('hover');
    const removeHover = () => cursor.classList.remove('hover');

    document.querySelectorAll('button, a, .emotion-card-new, .song-card, .emoji-option, .player-close-btn').forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
       document.querySelectorAll('button, a, .emotion-card-new, .song-card, .emoji-option, .player-close-btn').forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, [appVisible]);
  
  // Hero Animations
  useEffect(() => {
    if (appVisible) return;

    const heroSection = heroRef.current;
    if (!heroSection) return;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;

      gsap.to(heroContentRef.current, {
        rotateY: x * 15,
        rotateX: y * -15,
        ease: 'power1.out',
      });
    };
    
    heroSection.addEventListener('mousemove', onMouseMove);
    return () => heroSection.removeEventListener('mousemove', onMouseMove);
  }, [appVisible]);

  // Audio Player Logic
  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [isPlaying, nowPlaying]);

  // Home page entrance animation
  useEffect(() => {
    if (appVisible && activePage === 'home') {
      const homeTitleChars = document.querySelectorAll('.home-title-char');
      const homeSubtitle = document.querySelector('#home .home-subtitle');
      const cards = document.querySelectorAll('.emotion-card-new, .create-mood-card');
      
      const tl = gsap.timeline();
      tl.set([homeTitleChars, homeSubtitle, cards], { clearProps: 'all' }) // Reset properties
        .fromTo(homeTitleChars, 
          { opacity: 0, y: 30, rotateX: -90 }, 
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.03, ease: 'back.out(1.7)' }
        )
        .fromTo(homeSubtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, "-=0.6")
        .fromTo(cards, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.4)' }, "-=0.4");
    }
  }, [appVisible, activePage]);
  
  // Mood page entrance animation
  useEffect(() => {
    if (activePage !== 'home' && activePage !== '') {
      const songCards = document.querySelectorAll(`#${activePage} .song-card`);
      gsap.fromTo(songCards, 
        { opacity: 0, y: 30, scale: 0.95 }, 
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'back.out(1.4)' 
        }
      );
    }
  }, [activePage]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleSongEnd = () => {
    handleNext();
  };

  const handleNext = () => {
    if (!nowPlaying) return;
    const { mood, index } = nowPlaying;
    const playlist = tracks[mood as keyof typeof tracks];
    const nextIndex = (index + 1) % playlist.length;
    setNowPlaying({ mood, index: nextIndex });
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!nowPlaying) return;
    const { mood, index } = nowPlaying;
    const playlist = tracks[mood as keyof typeof tracks];
    const prevIndex = (index - 1 + playlist.length) % playlist.length;
    setNowPlaying({ mood, index: prevIndex });
    setIsPlaying(true);
  };
  
  const openPlayer = (mood: string, index: number) => {
    const playlist = tracks[mood as keyof typeof tracks];
    setNowPlaying({ mood, index: index % playlist.length });
    setIsPlaying(true);
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setNowPlaying(null);
  };

  const isLiked = (track: Track) => {
    return likedSongs.some(likedTrack => likedTrack.src === track.src);
  }

  const handleLike = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const target = e.currentTarget;
    gsap.fromTo(target, { scale: 1 }, { scale: 1.3, duration: 0.2, ease: 'back.out(1.7)', yoyo: true, repeat: 1 });

    setLikedSongs(prev => {
      if (isLiked(track)) {
        return prev.filter(likedTrack => likedTrack.src !== track.src);
      } else {
        const trackWithContext = { ...track, mood: track.mood || nowPlaying?.mood, index: track.index ?? nowPlaying?.index };
        return [...prev, trackWithContext];
      }
    });
  }

 const openPage = (id: string) => {
    gsap.to('.page.active', {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setActivePage(id);
        document.body.className = id ? `${id}-active` : '';
        
        const allMoods = {...MOOD_DEFS, ...customMoods};
        const moodDef = allMoods[id as keyof typeof allMoods];

        if (moodDef) {
            document.body.style.background = moodDef.bg;
            document.documentElement.style.setProperty('--page-accent', moodDef.accent);
            document.body.classList.add(moodDef.themeClass || `custom-theme-active`);
            if (['happy', 'joyful', 'sad'].includes(id) || customMoods[id]) {
              document.body.classList.add('theme-active');
            }
        } else { // Home page
            document.body.style.background = 'linear-gradient(135deg, #1d2b3c 0%, #0f1724 100%)';
            document.documentElement.style.setProperty('--page-accent', '#60a5fa');
            document.body.className = 'home-active';
        }
        setIsMenuSheetOpen(false);
      }
    });
  };

  const enterApp = () => {
      const tl = gsap.timeline({
        onComplete: () => {
            setAppVisible(true);
            openPage('home');
        }
      });

      tl.to(heroContentRef.current, {
        duration: 0.8,
        opacity: 0,
        scale: 0.8,
        ease: 'power3.in',
      })
      .to(heroRef.current, {
        duration: 0.6,
        opacity: 0,
        ease: 'power3.in'
      }, "-=0.6");
  };

  const handleGenerateMood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customMoodFormData.name || !customMoodFormData.emoji || !customMoodFormData.description) return;
    
    setIsGenerating(true);
    const input: GenerateMoodInput = customMoodFormData;

    try {
      const result = await generateMood(input);
      const moodId = input.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

      setCustomMoods(prev => ({
        ...prev,
        [moodId]: {
          title: `${result.title} — AI Generated`,
          subtitle: result.subtitle,
          accent: result.theme.accent,
          bg: `linear-gradient(135deg, ${result.theme.start} 0%, ${result.theme.end} 100%)`,
          emoji: input.emoji,
          themeClass: 'custom-theme-active'
        }
      }));

      const newTracks = result.playlist.map((song, index) => ({
        ...song,
        src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(1 + index) % 16 + 1}.mp3`,
        cover: `https://picsum.photos/seed/${moodId}${index}/600/600`,
      }));

      setTracks(prev => ({
        ...prev,
        [moodId]: newTracks,
      }));
      
      setIsCustomMoodDialogOpen(false);
      setCustomMoodFormData({ name: '', emoji: '', description: '' });
      openPage(moodId);

    } catch (error) {
      console.error("Failed to generate mood:", error);
      // You could show a toast notification here
    } finally {
      setIsGenerating(false);
    }
  };


  const currentTrack = nowPlaying ? tracks[nowPlaying.mood as keyof typeof tracks][nowPlaying.index] : null;
  const allMoods = { ...MOOD_DEFS, ...customMoods };
  const isFormValid = customMoodFormData.name && customMoodFormData.emoji && customMoodFormData.description;

  const NavMenu = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="accordion-trigger">My Playlist</AccordionTrigger>
        <AccordionContent>
          {likedSongs.length > 0 ? (
            <ul className="mobile-menu-items">
              {likedSongs.map((track, index) => (
                <li key={index}>
                  <a href="#" className="playlist-item" onClick={(e) => { e.preventDefault(); openPlayer(track.mood!, track.index!) }}>
                    <Image src={track.cover} alt={track.title} width={40} height={40} className="playlist-item-cover" data-ai-hint="song cover" />
                    <span>{track.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-1 text-sm opacity-80">Your liked songs will appear here.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      {!appVisible && (
        <section className="creative-hero" ref={heroRef} onClick={enterApp}>
            <div className="hero-content" ref={heroContentRef}>
              <h1 className="sr-only">MoodyO</h1>
              <AnimatedText text="Moody" />
              <AnimatedText text="O" />
            </div>
        </section>
      )}

      {appVisible && (
        <div className="app">
              <header>
                <div className="header-inner">
                    <div className="logo">
                      MoodyO
                    </div>
                    <nav>
                      <Sheet open={isMenuSheetOpen} onOpenChange={setIsMenuSheetOpen}>
                        <SheetTrigger asChild>
                           <button className="nav-btn">
                            <Menu size={20} />
                          </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="main-menu-sheet sheet-content">
                          <SheetHeader>
                             <SheetTitle className="sr-only">Main Menu</SheetTitle>
                            <a href="#" onClick={(e) => { e.preventDefault(); openPage('home'); }} className="logo">MoodyO</a>
                          </SheetHeader>
                          <div className="flex flex-col py-4">
                             <a href="#" onClick={(e) => { e.preventDefault(); openPage('home'); }}>Home</a>
                            {Object.keys(allMoods).map(mood => (
                              <a key={mood} href="#" onClick={(e) => { e.preventDefault(); openPage(mood); }}>
                                {allMoods[mood].title.split('—')[0]}
                              </a>
                            ))}
                          </div>
                           <div className="p-4 border-t border-glass-border">
                             <NavMenu />
                           </div>
                        </SheetContent>
                      </Sheet>
                    </nav>
                </div>
              </header>

          <main>
            <section id="home" className={cn('page', { active: activePage === 'home' })}>
                <div className="home-intro">
                    <AnimatedHomeTitle text="How are you feeling today?" />
                    <p className="home-subtitle" style={{ opacity: .85 }}>Tap a mood to explore curated songs and vibes. Each page has its own theme ✨</p>
                </div>
                <div className="home-mood-selector">
                  {Object.entries(allMoods).map(([key, { emoji, title }]) => (
                    <div key={key} className={cn('emotion-card-new', key)} onClick={() => openPage(key)}>
                      <div className="card-content">
                        <div className="emoji">{emoji}</div>
                        <div className="title">{title.split('—')[0]}</div>
                      </div>
                    </div>
                  ))}
                  <div className="emotion-card-new create-mood-card" onClick={() => setIsCustomMoodDialogOpen(true)}>
                    <div className="card-content">
                      <div className="emoji"><Wand2 size={72} /></div>
                      <div className="title">Create Your Own</div>
                    </div>
                  </div>
                </div>
            </section>

            {Object.entries(allMoods).map(([mood, def]) => (
              <section key={mood} id={mood} className={cn('page', { active: activePage === mood })}>
                <div className="glass">
                  <div className="page-header">
                    <div>
                      <h2>{def.title} <span className="badge">{def.emoji}</span></h2>
                      <small>{def.subtitle}</small>
                    </div>
                  </div>
                  <div className="song-grid-container">
                    <div className="song-grid">
                      {tracks[mood] && [...tracks[mood], ...tracks[mood]].map((track, index) => (
                        <div key={index} className="song-card" onClick={() => openPlayer(mood, index)}>
                          <Image className="cover" src={track.cover} alt={`${track.title} cover`} width={200} height={200} data-ai-hint="song cover" />
                          <div className="song-card-content">
                            <div className="song-title-wrapper">
                                <button onClick={(e) => handleLike(e, { ...track, mood: mood, index: index % tracks[mood].length })} className={cn('like-btn', { 'liked': isLiked(track) })}>
                                  <Heart size={18} />
                                </button>
                                <div className="song-title">{track.title}</div>
                            </div>
                            <div className="song-artist">{track.artist}</div>
                            <button className="play-small">▶</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </main>

          <footer>
            <small>Made with ❤️ MoodyO — mood based audio UI demo</small>
          </footer>
        </div>
      )}

      {nowPlaying && currentTrack && (
        <div className="player-dialog-overlay">
            <div className="player-dialog glass">
                <button onClick={closePlayer} className="player-close-btn"><X size={24} /></button>
                <Image className="player-cover" src={currentTrack.cover} alt={currentTrack.title} width={400} height={400} data-ai-hint="song cover" />
                <div className="player-info">
                    <h3>{currentTrack.title}</h3>
                    <p>{currentTrack.artist}</p>
                </div>
                 <div className="player-controls">
                    <button onClick={handlePrev}><SkipBack /></button>
                    <button onClick={handlePlayPause} className="play-main-btn">
                        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                    </button>
                    <button onClick={handleNext}><SkipForward /></button>
                </div>
                 <div className="player-actions">
                    <button onClick={(e) => handleLike(e, { ...currentTrack, mood: nowPlaying.mood, index: nowPlaying.index })} className={cn('like-btn', { 'liked': isLiked(currentTrack) })}>
                        <Heart size={24} />
                    </button>
                </div>
                <audio ref={audioRef} src={currentTrack.src} onEnded={handleSongEnd} onPlay={()=>setIsPlaying(true)} onPause={()=>setIsPlaying(false)} />
            </div>
        </div>
      )}

      <Dialog open={isCustomMoodDialogOpen} onOpenChange={setIsCustomMoodDialogOpen}>
        <DialogContent className="sheet-content glass">
          <DialogHeader>
            <DialogTitle>Create a Custom Mood</DialogTitle>
            <DialogDescription>
              Describe the vibe, and AI will generate a unique mood page for you.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateMood} className="flex flex-col gap-4">
            <Input 
              name="name" 
              placeholder="Mood Name (e.g., Cosmic Jazz)" 
              required 
              value={customMoodFormData.name}
              onChange={(e) => setCustomMoodFormData({...customMoodFormData, name: e.target.value })}
            />
             <div>
              <div className="emoji-picker">
                {['🎷', '📚', '🌧️', '🌲', '🚀', '👾'].map(emoji => (
                  <span 
                    key={emoji}
                    className={cn('emoji-option', { selected: customMoodFormData.emoji === emoji })}
                    onClick={() => setCustomMoodFormData({...customMoodFormData, emoji })}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <Input 
                name="emoji" 
                placeholder="Select an emoji from above or type one" 
                required 
                maxLength={2} 
                value={customMoodFormData.emoji}
                onChange={(e) => setCustomMoodFormData({...customMoodFormData, emoji: e.target.value })}
              />
            </div>
            <Input 
              name="description" 
              placeholder="Description (e.g., Late night jazz in a space lounge)" 
              required
              value={customMoodFormData.description}
              onChange={(e) => setCustomMoodFormData({...customMoodFormData, description: e.target.value })}
            />
            <Button type="submit" disabled={isGenerating || !isFormValid}>
              {isGenerating ? <><Loader className="animate-spin mr-2" size={16}/> Generating...</> : "Generate Mood"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
