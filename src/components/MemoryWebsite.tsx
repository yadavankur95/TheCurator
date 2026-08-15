import { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Film,
  Filter,
  FolderUp,
  HardDriveDownload,
  Heart,
  Image as ImageIcon,
  Layers,
  Music,
  Play,
  Quote,
  RefreshCw,
  Search,
  Share2,
  Sliders,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BirthdayQuote, Chapter, EventType, MediaItem, MemoryStory, Scene } from '../types';
import { EVENT_PRESETS, getEventPreset, getQuotesForEvent } from '../data/quotes';
import { birthdayAudio } from '../utils/audioAmbience';
import { MediaLightbox } from './MediaLightbox';
import { QuoteModal } from './QuoteModal';
import { ExportVideoModal } from './ExportVideoModal';

interface MemoryWebsiteProps {
  story: MemoryStory;
  allMedia: MediaItem[];
  onPlaySlideshow: (startIndex?: number) => void;
  onOpenStudio: () => void;
  onUploadMore: () => void;
  onRegenerate: () => void;
  onChangeEventType: (eventType: EventType) => void;
  onUpdateStory: (updated: MemoryStory) => void;
}

export function MemoryWebsite({
  story,
  allMedia,
  onPlaySlideshow,
  onOpenStudio,
  onUploadMore,
  onRegenerate,
  onChangeEventType,
  onUpdateStory,
}: MemoryWebsiteProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'videos' | 'photos' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [celebrateEffect, setCelebrateEffect] = useState(false);

  const currentEvent = getEventPreset(story.eventType || 'mother-daughter-birthday');
  const eventQuotes = useMemo(() => getQuotesForEvent(story.eventType || 'mother-daughter-birthday'), [story.eventType]);

  const videoCount = useMemo(() => allMedia.filter((m) => m.type === 'video').length, [allMedia]);
  const imageCount = useMemo(() => allMedia.filter((m) => m.type === 'image').length, [allMedia]);

  const filteredMedia = useMemo(() => {
    return allMedia.filter((item) => {
      if (selectedFilter === 'videos' && item.type !== 'video') return false;
      if (selectedFilter === 'photos' && item.type !== 'image') return false;
      if (selectedFilter === 'favorites' && !item.isFavorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (item.name || '').toLowerCase().includes(q) || (item.alt || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [allMedia, selectedFilter, searchQuery]);

  const handleToggleMusic = () => {
    const nextState = birthdayAudio.toggle();
    setIsMusicPlaying(nextState);
  };

  const handleTriggerCelebration = () => {
    setCelebrateEffect(true);
    setTimeout(() => setCelebrateEffect(false), 4500);
  };

  const handleToggleFavorite = (mediaId: string) => {
    const updatedMedia = allMedia.map((m) =>
      m.id === mediaId ? { ...m, isFavorite: !m.isFavorite } : m
    );
    // Update scenes as well
    const updatedScenes = story.scenes.map((s) => ({
      ...s,
      media: s.media.map((m) => (m.id === mediaId ? { ...m, isFavorite: !m.isFavorite } : m)),
    }));
    onUpdateStory({
      ...story,
      scenes: updatedScenes,
    });
  };

  const activeChapter = story.chapters[activeChapterIndex] || story.chapters[0];

  return (
    <div className="website-root">
      {/* Celebration floating particles effect */}
      {celebrateEffect && (
        <div className="confetti-burst">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.8}s`,
                backgroundColor: ['#d4af37', '#e11d48', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'][
                  i % 6
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Luxury Navigation Header */}
      <header className="web-header">
        <div className="header-brand">
          <span className="brand-wordmark">The Curator</span>
          <span className="brand-badge">Mother & Daughter Birthday Edition</span>
        </div>

        <div className="header-actions">
          <button
            className={`ambient-audio-btn ${isMusicPlaying ? 'playing' : ''}`}
            onClick={handleToggleMusic}
            title="Toggle Birthday Ambient Melody"
          >
            {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{isMusicPlaying ? 'Melody Playing' : 'Background Melody'}</span>
          </button>

          <button className="header-btn-secondary" onClick={onUploadMore} title="Upload more photos & videos">
            <Upload size={15} /> Upload Files
          </button>

          <button className="header-btn-secondary" onClick={onOpenStudio}>
            <Sliders size={15} /> Customize
          </button>

          <button
            className="header-btn-export"
            onClick={() => setIsExportModalOpen(true)}
            title="Export slideshow as MP4 / WebM video file"
          >
            <HardDriveDownload size={15} /> Export Video
          </button>

          <button className="header-btn-primary" onClick={() => onPlaySlideshow(0)}>
            <Play size={15} fill="currentColor" /> Play Slideshow ({story.scenes.length} Scenes)
          </button>
        </div>
      </header>

      {/* Grand Hero Section */}
      <section className="web-hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-pill-badge" onClick={handleTriggerCelebration}>
            <Sparkles size={14} className="sparkle-gold" />
            <span>{currentEvent.badge} · {currentEvent.title}</span>
            <Heart size={13} className="heart-pink" fill="#e11d48" />
          </div>

          <h1 className="hero-main-title">
            {story.title.split(',')[0]}
            {story.title.includes(',') ? ',' : ''}
            <br />
            <em>{story.title.split(',')[1] || story.subtitle.split('·')[0]}</em>
          </h1>

          <p className="hero-subtext">
            {currentEvent.description} Preserving all <strong>{allMedia.length} treasured photos & videos</strong>.
          </p>

          {/* Event Preset Selector Bar */}
          <div className="hero-event-switcher">
            <span className="event-switch-label">Choose Event Mode:</span>
            <div className="hero-event-pills">
              {EVENT_PRESETS.map((preset) => {
                const isSelected = (story.eventType || 'mother-daughter-birthday') === preset.id;
                return (
                  <button
                    key={preset.id}
                    className={`hero-event-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => onChangeEventType(preset.id)}
                  >
                    {preset.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <span className="stat-number">{allMedia.length}</span>
              <span className="stat-label">Total Memories Handled</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{videoCount}</span>
              <span className="stat-label">Living Video Clips</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{imageCount}</span>
              <span className="stat-label">High-Res Photos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{story.chapters.length}</span>
              <span className="stat-label">Story Chapters</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{Math.round(story.totalDurationSeconds / 60)}m {story.totalDurationSeconds % 60}s</span>
              <span className="stat-label">Slideshow Runtime</span>
            </div>
          </div>

          <div className="hero-cta-row">
            <button className="cta-play-hero" onClick={() => onPlaySlideshow(0)}>
              <Play size={18} fill="currentColor" /> Launch Fullscreen Slideshow
            </button>
            <button className="cta-export-hero" onClick={() => setIsExportModalOpen(true)}>
              <HardDriveDownload size={18} /> Export as Video File
            </button>
            <button className="cta-secondary-hero" onClick={onUploadMore}>
              <Upload size={16} /> Upload 120+ Photos/Videos
            </button>
            <button className="cta-secondary-hero" onClick={onRegenerate}>
              <RefreshCw size={16} /> Shuffle Variations
            </button>
          </div>
        </div>
      </section>

      {/* Chapters & Storyboard Exploration */}
      <section className="web-section chapters-section">
        <div className="section-header-row">
          <div>
            <span className="eyebrow">Curated Storyboard</span>
            <h2 className="section-title">The Chapters of Us</h2>
            <p className="section-description">
              Every photo and video is curated into themed chapters that tell the story of growing up and celebrating together.
            </p>
          </div>

          <div className="chapter-nav-pills">
            {story.chapters.map((chap, idx) => (
              <button
                key={chap.id}
                className={`chapter-pill ${idx === activeChapterIndex ? 'active' : ''}`}
                onClick={() => setActiveChapterIndex(idx)}
              >
                <span>Ch. {idx + 1}</span> {chap.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Chapter Showcase Card */}
        {activeChapter && (
          <div className="active-chapter-display">
            <div className="chapter-info-banner">
              <div className="chapter-text-left">
                <span className="chapter-num-tag">Chapter {activeChapterIndex + 1} of {story.chapters.length}</span>
                <h3>{activeChapter.title}</h3>
                <p className="chapter-sub">{activeChapter.subtitle}</p>
                <p className="chapter-desc">{activeChapter.description}</p>
              </div>
              <div className="chapter-stats-right">
                <span className="chapter-media-count">{activeChapter.mediaCount} Moments</span>
                <button
                  className="chapter-play-btn"
                  onClick={() => {
                    const sceneGlobalIdx = story.scenes.findIndex((s) => s.id === activeChapter.scenes[0]?.id);
                    onPlaySlideshow(sceneGlobalIdx >= 0 ? sceneGlobalIdx : 0);
                  }}
                >
                  <Play size={14} fill="currentColor" /> Play this Chapter
                </button>
              </div>
            </div>

            {/* Scenes inside this chapter */}
            <div className="chapter-scenes-grid">
              {activeChapter.scenes.map((scene, sIdx) => (
                <div
                  key={scene.id}
                  className="chapter-scene-card"
                  onClick={() => {
                    const globalIdx = story.scenes.findIndex((s) => s.id === scene.id);
                    onPlaySlideshow(globalIdx >= 0 ? globalIdx : 0);
                  }}
                >
                  <div className="scene-thumb-preview">
                    {scene.media[0]?.type === 'video' ? (
                      <video src={scene.media[0].url} muted playsInline className="scene-card-img" />
                    ) : (
                      <img src={scene.media[0]?.url} alt="" className="scene-card-img" />
                    )}
                    <span className="scene-layout-tag">{scene.layout}</span>
                    <span className="scene-media-pill">{scene.media.length} items</span>
                    <div className="scene-card-overlay">
                      <Play size={24} fill="#ffffff" />
                    </div>
                  </div>
                  <div className="scene-card-meta">
                    <p className="scene-caption-preview">{scene.text || scene.caption || 'Cherished celebration moment'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Event Quotes Wall Section */}
      <section className="web-section quotes-wall-section">
        <div className="quotes-wall-header">
          <div>
            <span className="eyebrow"><Quote size={13} className="inline-icon" /> {currentEvent.badge}</span>
            <h2 className="section-title">Quotes & Heartfelt Words</h2>
            <p className="section-description">
              Curated poetic tributes crafted for {currentEvent.title}.
            </p>
          </div>
          <button className="btn-explore-quotes" onClick={() => setIsQuoteModalOpen(true)}>
            <Sparkles size={16} /> Browse & Pick All Quotes
          </button>
        </div>

        <div className="quotes-carousel-grid">
          {eventQuotes.slice(0, 6).map((quote) => (
            <div key={quote.id} className={`quote-tile-card ${quote.isOriginal ? 'original-featured' : ''}`}>
              <div className="quote-icon-top">
                <Quote size={20} />
                {quote.isOriginal && <span className="badge-original">Core Tribute</span>}
              </div>
              <p className="quote-text-body">{quote.text}</p>
              {quote.author && <span className="quote-author-line">— {quote.author}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* The Complete Media Vault Section (Handles all 122+ media) */}
      <section className="web-section vault-section" id="media-vault">
        <div className="vault-header">
          <div>
            <span className="eyebrow">The Complete Collection</span>
            <h2 className="section-title">All {allMedia.length} Photos & Videos</h2>
            <p className="section-description">
              Every single uploaded memory is preserved below. Click any photo or video to open in high-definition theater mode.
            </p>
          </div>

          <div className="vault-controls-bar">
            {/* Search Input */}
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                All ({allMedia.length})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'videos' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('videos')}
              >
                <Film size={14} /> Videos ({videoCount})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'photos' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('photos')}
              >
                <ImageIcon size={14} /> Photos ({imageCount})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'favorites' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('favorites')}
              >
                <Heart size={14} /> Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="vault-masonry-grid">
          {filteredMedia.map((item, index) => {
            const isVideo = item.type === 'video';
            return (
              <div
                key={item.id || index}
                className={`vault-item-card ${isVideo ? 'is-video-card' : ''}`}
                onClick={() => setLightboxIndex(index)}
              >
                <div className="vault-media-frame">
                  {isVideo ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="vault-media-img"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt}
                      loading="lazy"
                      className="vault-media-img"
                    />
                  )}

                  {/* Badges */}
                  <div className="media-overlay-badges">
                    {isVideo && (
                      <span className="type-badge video">
                        <Film size={12} /> Video {item.duration ? `${Math.round(item.duration)}s` : ''}
                      </span>
                    )}
                  </div>

                  <button
                    className={`fav-star-btn ${item.isFavorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item.id);
                    }}
                    title="Toggle Favorite"
                  >
                    <Heart size={15} fill={item.isFavorite ? '#e11d48' : 'none'} color={item.isFavorite ? '#e11d48' : '#ffffff'} />
                  </button>

                  <div className="hover-play-glyph">
                    <Play size={26} fill="#ffffff" />
                  </div>
                </div>

                <div className="vault-item-caption">
                  <span className="vault-date">{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Website Footer */}
      <footer className="website-footer">
        <div className="footer-content">
          <span className="brand-wordmark">The Curator</span>
          <p className="footer-tagline">
            "Two Birthdays, One Beautiful Story" · Designed with love for Mother & Daughter.
          </p>
          <div className="footer-button-row">
            <button className="footer-btn" onClick={() => onPlaySlideshow(0)}>
              <Play size={14} fill="currentColor" /> Play Slideshow
            </button>
            <button className="footer-btn" onClick={onOpenStudio}>
              <Sliders size={14} /> Story Director Studio
            </button>
            <button className="footer-btn" onClick={onUploadMore}>
              <Layers size={14} /> Upload More Photos & Videos
            </button>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <MediaLightbox
          media={filteredMedia}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onSelectIndex={(newIdx) => setLightboxIndex(newIdx)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Quotes Explorer Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSelectQuote={(quote) => {
          // Quote selected
        }}
      />

      {/* Export Video Modal */}
      <ExportVideoModal
        story={story}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
