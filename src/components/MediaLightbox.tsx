import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Heart, Maximize2, Tag, Calendar, Film, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaLightboxProps {
  media: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onToggleFavorite?: (id: string) => void;
}

export function MediaLightbox({
  media,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  onToggleFavorite,
}: MediaLightboxProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = media[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onSelectIndex((currentIndex + 1) % media.length);
      if (e.key === 'ArrowLeft') onSelectIndex((currentIndex - 1 + media.length) % media.length);
      if (e.key === ' ' && currentItem?.type === 'video') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, media.length, onClose, onSelectIndex, currentItem]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  if (!isOpen || !currentItem) return null;

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || currentItem.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="lightbox-header">
          <div className="lightbox-meta">
            <span className="media-badge">
              {currentItem.type === 'video' ? <Film size={14} /> : <ImageIcon size={14} />}
              {currentItem.type.toUpperCase()} · {currentIndex + 1} of {media.length}
            </span>
            <span className="lightbox-date"><Calendar size={13} /> {currentItem.date}</span>
          </div>
          <div className="lightbox-header-actions">
            {onToggleFavorite && (
              <button
                className={`icon-btn ${currentItem.isFavorite ? 'active-fav' : ''}`}
                onClick={() => onToggleFavorite(currentItem.id)}
                title="Favorite"
              >
                <Heart size={18} fill={currentItem.isFavorite ? '#e11d48' : 'none'} color={currentItem.isFavorite ? '#e11d48' : 'currentColor'} />
              </button>
            )}
            <button className="icon-btn" onClick={onClose} title="Close Lightbox">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Media Presentation View */}
        <div className="lightbox-stage">
          {media.length > 1 && (
            <button
              className="stage-nav-btn prev"
              onClick={() => onSelectIndex((currentIndex - 1 + media.length) % media.length)}
              aria-label="Previous media"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          <div className="stage-content">
            {currentItem.type === 'video' ? (
              <div className="lightbox-video-wrapper">
                <video
                  ref={videoRef}
                  src={currentItem.url}
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="lightbox-video-element"
                />

                {/* Custom Video Controls */}
                <div className="lightbox-video-controls">
                  <button className="ctrl-btn" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="video-seek-slider"
                  />
                  <button className="ctrl-btn" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            ) : (
              <img src={currentItem.url} alt={currentItem.alt} className="lightbox-image-element" />
            )}
          </div>

          {media.length > 1 && (
            <button
              className="stage-nav-btn next"
              onClick={() => onSelectIndex((currentIndex + 1) % media.length)}
              aria-label="Next media"
            >
              <ChevronRight size={30} />
            </button>
          )}
        </div>

        {/* Caption & Info footer */}
        <div className="lightbox-footer">
          <p className="lightbox-caption">{currentItem.alt || currentItem.name}</p>
        </div>
      </div>
    </div>
  );
}
