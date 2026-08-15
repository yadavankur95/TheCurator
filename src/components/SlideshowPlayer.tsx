import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HardDriveDownload,
  Maximize,
  Minimize,
  Music,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Heart,
  Quote as QuoteIcon,
  Film,
} from 'lucide-react';
import { MediaItem, MemoryStory, Scene } from '../types';
import { birthdayAudio } from '../utils/audioAmbience';
import { ExportVideoModal } from './ExportVideoModal';

interface SlideshowPlayerProps {
  story: MemoryStory;
  initialSceneIndex?: number;
  onExit: () => void;
  onOpenStudio?: () => void;
}

export function SlideshowPlayer({
  story,
  initialSceneIndex = 0,
  onExit,
  onOpenStudio,
}: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSceneIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [bgMusicActive, setBgMusicActive] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeScene = story.scenes[currentIndex] || story.scenes[0];

  // Calculate duration of current scene (including video durations)
  const currentSceneDuration = (() => {
    let dur = activeScene.duration || 6500;
    activeScene.media.forEach((item) => {
      if (item.type === 'video' && item.duration && item.duration > 0) {
        dur = Math.max(dur, (item.duration + 0.5) * 1000);
      }
    });
    return Math.max(3000, dur / playbackSpeed);
  })();

  // Autoplay progression & progress bar
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();
    setProgressPercent(0);

    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / currentSceneDuration) * 100);
      setProgressPercent(pct);
    }, 50);

    const autoTimer = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % story.scenes.length);
    }, currentSceneDuration);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(autoTimer);
    };
  }, [currentIndex, isPlaying, currentSceneDuration, story.scenes.length, playbackSpeed]);

  // Handle ambient background music
  useEffect(() => {
    if (bgMusicActive && isPlaying) {
      birthdayAudio.play();
    } else {
      birthdayAudio.pause();
    }
    return () => {
      birthdayAudio.pause();
    };
  }, [bgMusicActive, isPlaying]);

  // Controls reveal timer on mouse / touch interaction
  useEffect(() => {
    let timer: number | undefined;
    const reveal = () => {
      setShowControls(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!showDrawer) {
          setShowControls(false);
        }
      }, 4000);
    };

    window.addEventListener('mousemove', reveal);
    window.addEventListener('touchstart', reveal);
    reveal();

    return () => {
      window.removeEventListener('mousemove', reveal);
      window.removeEventListener('touchstart', reveal);
      window.clearTimeout(timer);
    };
  }, [showDrawer]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % story.scenes.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + story.scenes.length) % story.scenes.length);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.().catch(() => {});
          setIsFullscreen(false);
        } else {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [story.scenes.length, isFullscreen, onExit]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % story.scenes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + story.scenes.length) % story.scenes.length);
  };

  return (
    <div
      ref={containerRef}
      className={`player-fullscreen-root ${activeScene.layout === 'opening' || activeScene.layout === 'portrait' ? 'theme-warm-light' : 'theme-cinematic-dark'}`}
    >
      {/* Active Scene Content */}
      <div className="player-scene-stage" key={activeScene.id}>
        <SceneRenderer scene={activeScene} isMuted={isMuted} isPlaying={isPlaying} />
      </div>

      {/* Top Glass Bar */}
      <div className={`player-overlay-top ${showControls ? 'visible' : 'hidden'}`}>
        <div className="top-left">
          <button className="glass-btn-round" onClick={onExit} title="Exit to Website">
            <X size={20} />
          </button>
          <div className="top-title-meta">
            <span className="eyebrow"><Heart size={12} className="inline-icon" /> Mother & Daughter Birthday Story</span>
            <span className="story-name">{story.title}</span>
            {activeScene.chapterTitle && (
              <span className="chapter-tag">{activeScene.chapterTitle}</span>
            )}
          </div>
        </div>

        <div className="top-right">
          <button
            className="glass-btn-pill"
            onClick={() => setIsExportModalOpen(true)}
            title="Export full slideshow as video file"
          >
            <HardDriveDownload size={15} />
            <span>Export Video</span>
          </button>

          <button
            className={`glass-btn-pill ${bgMusicActive ? 'active' : ''}`}
            onClick={() => setBgMusicActive((prev) => !prev)}
            title="Toggle Ambient Birthday Melody"
          >
            <Music size={16} />
            <span>{bgMusicActive ? 'Melody On' : 'Melody Off'}</span>
          </button>

          <button
            className={`glass-btn-pill ${isMuted ? '' : 'active'}`}
            onClick={() => setIsMuted((prev) => !prev)}
            title="Toggle Video Sound"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          <button
            className="glass-btn-round"
            onClick={() => setShowDrawer((prev) => !prev)}
            title="All Scenes Drawer"
          >
            <Sliders size={18} />
          </button>

          <button
            className="glass-btn-round"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className={`player-overlay-bottom ${showControls ? 'visible' : 'hidden'}`}>
        {/* Progress Bar with segmented markers */}
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="scene-dots-track">
            {story.scenes.map((sc, idx) => (
              <button
                key={sc.id}
                className={`scene-dot ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'passed' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={`Jump to Scene ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="bottom-controls-row">
          <div className="scene-counter">
            <span>Scene {currentIndex + 1} of {story.scenes.length}</span>
          </div>

          <div className="center-playback-buttons">
            <button className="ctrl-btn-circle" onClick={handlePrev} title="Previous Scene (←)">
              <ChevronLeft size={22} />
            </button>
            <button
              className="ctrl-btn-play-hero"
              onClick={() => setIsPlaying((prev) => !prev)}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="ctrl-btn-circle" onClick={handleNext} title="Next Scene (→)">
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="speed-selector">
            {[0.75, 1, 1.25].map((spd) => (
              <button
                key={spd}
                className={`speed-chip ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-out Scene Navigator Drawer */}
      {showDrawer && (
        <div className="scene-drawer-panel">
          <div className="drawer-header">
            <h3>All Scenes ({story.scenes.length})</h3>
            <button className="icon-btn-close" onClick={() => setShowDrawer(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="drawer-scenes-scroll">
            {story.scenes.map((sc, idx) => (
              <div
                key={sc.id}
                className={`drawer-scene-card ${idx === currentIndex ? 'is-active' : ''}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowDrawer(false);
                }}
              >
                <div className="drawer-thumb-wrap">
                  {sc.media[0]?.type === 'video' ? (
                    <video src={sc.media[0].url} muted playsInline className="drawer-thumb" />
                  ) : (
                    <img src={sc.media[0]?.url} alt="" className="drawer-thumb" />
                  )}
                  <span className="drawer-index-tag">{idx + 1}</span>
                </div>
                <div className="drawer-card-info">
                  <span className="drawer-layout-name">{sc.layout.toUpperCase()}</span>
                  <p className="drawer-scene-text">{sc.text || sc.caption || `${sc.media.length} items`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Video Modal */}
      <ExportVideoModal
        story={story}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

// Scene Visual Renderer for various Layouts
function SceneRenderer({ scene, isMuted, isPlaying }: { scene: Scene; isMuted: boolean; isPlaying: boolean }) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) {
        v.muted = isMuted;
        if (isPlaying) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  }, [isPlaying, isMuted, scene]);

  switch (scene.layout) {
    case 'opening':
      return (
        <div className="scene-layout-opening animate-fade-in">
          <div className="opening-hero-text">
            <span className="eyebrow sparkle-eyebrow">
              <Sparkles size={14} /> Two Birthdays · Mother & Daughter
            </span>
            <h1 className="opening-title">
              {scene.text?.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h1>
            <p className="opening-sub">{scene.subtitle || 'A lifelong story of shared love, laughter, and blessings.'}</p>
          </div>
          <div className="opening-media-frame">
            <MediaElement
              item={scene.media[0]}
              isMuted={isMuted}
              isPlaying={isPlaying}
              className="opening-media-img"
            />
          </div>
        </div>
      );

    case 'pair':
      return (
        <div className="scene-layout-pair animate-fade-in">
          <div className="pair-container">
            {scene.media.slice(0, 2).map((item, i) => (
              <div key={item.id || i} className="pair-item">
                <MediaElement item={item} isMuted={isMuted} isPlaying={isPlaying} className="pair-img" />
              </div>
            ))}
          </div>
          {scene.caption && (
            <div className="scene-floating-caption">
              <p>{scene.caption}</p>
            </div>
          )}
        </div>
      );

    case 'trio':
      return (
        <div className="scene-layout-trio animate-fade-in">
          <div className="trio-container">
            {scene.media.slice(0, 3).map((item, i) => (
              <div key={item.id || i} className="trio-item">
                <MediaElement item={item} isMuted={isMuted} isPlaying={isPlaying} className="trio-img" />
              </div>
            ))}
          </div>
          {scene.caption && (
            <div className="scene-floating-caption">
              <p>{scene.caption}</p>
            </div>
          )}
        </div>
      );

    case 'collage':
      return (
        <div className="scene-layout-collage animate-fade-in">
          <div className="collage-grid-4">
            {scene.media.slice(0, 4).map((item, i) => (
              <div key={item.id || i} className={`collage-cell cell-${i}`}>
                <MediaElement item={item} isMuted={isMuted} isPlaying={isPlaying} className="collage-img" />
              </div>
            ))}
          </div>
          {scene.caption && (
            <div className="scene-floating-caption">
              <p>{scene.caption}</p>
            </div>
          )}
        </div>
      );

    case 'mosaic':
      return (
        <div className="scene-layout-mosaic animate-fade-in">
          <div className="mosaic-grid-6">
            {scene.media.slice(0, 6).map((item, i) => (
              <div key={item.id || i} className={`mosaic-cell mcell-${i}`}>
                <MediaElement item={item} isMuted={isMuted} isPlaying={isPlaying} className="mosaic-img" />
              </div>
            ))}
          </div>
          {scene.caption && (
            <div className="scene-floating-caption">
              <p>{scene.caption}</p>
            </div>
          )}
        </div>
      );

    case 'quote':
      return (
        <div className="scene-layout-quote animate-fade-in">
          <div className="quote-bg-media">
            <MediaElement item={scene.media[0]} isMuted={isMuted} isPlaying={isPlaying} className="quote-bg-img" />
            <div className="quote-scrim-overlay" />
          </div>
          <div className="quote-center-content">
            <QuoteIcon size={48} className="quote-large-icon" />
            <h2 className="quote-display-text">{scene.text}</h2>
            {scene.quoteAuthor && <span className="quote-author-sign">— {scene.quoteAuthor}</span>}
          </div>
        </div>
      );

    case 'portrait':
      return (
        <div className="scene-layout-portrait animate-fade-in">
          <div className="portrait-card">
            <MediaElement item={scene.media[0]} isMuted={isMuted} isPlaying={isPlaying} className="portrait-img" />
            {scene.text && (
              <div className="portrait-caption-box">
                <p>{scene.text}</p>
              </div>
            )}
          </div>
        </div>
      );

    case 'video-focus':
      return (
        <div className="scene-layout-video animate-fade-in">
          <div className="video-player-focus-stage">
            <MediaElement
              item={scene.media[0]}
              isMuted={isMuted}
              isPlaying={isPlaying}
              className="video-focus-media"
            />
          </div>
          {scene.text && (
            <div className="video-overlay-text">
              <span className="eyebrow"><Film size={12} className="inline-icon" /> Living Memory</span>
              <h3>{scene.text}</h3>
            </div>
          )}
        </div>
      );

    case 'ending':
      return (
        <div className="scene-layout-ending animate-fade-in">
          <div className="ending-bg-media">
            <MediaElement item={scene.media[0]} isMuted={isMuted} isPlaying={isPlaying} className="ending-img" />
            <div className="ending-scrim" />
          </div>
          <div className="ending-content">
            <span className="eyebrow celebration-sparkle">
              <Sparkles size={16} /> Double The Celebrations · Endless Love
            </span>
            <h1 className="ending-title">{scene.text}</h1>
            <p className="ending-subtitle">{scene.subtitle || 'Happy Birthday to Mom & Daughter sharing the sweetest day in the world!'}</p>
          </div>
        </div>
      );

    case 'full':
    default:
      return (
        <div className="scene-layout-full animate-fade-in">
          {/* Ambient blurred backdrop */}
          <div className="full-ambient-bg">
            <MediaElement item={scene.media[0]} isMuted={true} isPlaying={isPlaying} className="ambient-blur-media" />
          </div>
          {/* Main uncropped full photo/video */}
          <div className="full-main-stage">
            <MediaElement item={scene.media[0]} isMuted={isMuted} isPlaying={isPlaying} className="full-contain-media" />
          </div>
        </div>
      );
  }
}

function MediaElement({
  item,
  isMuted,
  isPlaying,
  className,
}: {
  item?: MediaItem;
  isMuted: boolean;
  isPlaying: boolean;
  className?: string;
}) {
  if (!item) return <div className={`placeholder-media ${className}`} />;

  if (item.type === 'video') {
    return (
      <video
        src={item.url}
        className={className}
        autoPlay
        playsInline
        loop
        muted={isMuted}
        preload="auto"
      />
    );
  }

  return <img src={item.url} alt={item.alt || ''} className={className} />;
}
