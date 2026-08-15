import { useState, useRef, ChangeEvent } from 'react';
import { X, Film, Image as ImageIcon, Search, Check, Upload, Plus } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMedia: MediaItem[];
  currentSelectedId?: string;
  onSelectMedia: (item: MediaItem) => void;
  onUploadNewMedia?: (item: MediaItem) => void;
  title?: string;
  actionLabel?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  allMedia,
  currentSelectedId,
  onSelectMedia,
  onUploadNewMedia,
  title = 'Select Photo or Video',
  actionLabel = 'Select Media',
}: MediaPickerModalProps) {
  const [filter, setFilter] = useState<'all' | 'videos' | 'photos'>('all');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filtered = allMedia.filter((item) => {
    if (filter === 'videos' && item.type !== 'video') return false;
    if (filter === 'photos' && item.type !== 'image') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (item.name || '').toLowerCase().includes(q) || (item.alt || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm|avi|m4v)$/i) !== null;
    const url = URL.createObjectURL(file);

    const newItem: MediaItem = {
      id: `manual-upload-${Date.now()}-${file.name}`,
      type: isVideo ? 'video' : 'image',
      url,
      thumbnail: url,
      name: file.name,
      width: 1920,
      height: 1080,
      orientation: 'landscape',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: isVideo ? 8 : undefined,
      qualityScore: 1.0,
      selected: true,
      alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    };

    onUploadNewMedia?.(newItem);
    onSelectMedia(newItem);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="media-picker-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <span className="eyebrow">Scene Media Director</span>
            <h2>{title}</h2>
            <p>Choose from your uploaded vault or upload a new photo/video.</p>
          </div>
          <button className="glass-icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="picker-controls-row">
          <div className="picker-search-wrap">
            <Search size={14} className="picker-search-icon" />
            <input
              type="text"
              placeholder="Filter media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="picker-search-input"
            />
          </div>

          <div className="picker-filter-chips">
            <button
              className={`chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({allMedia.length})
            </button>
            <button
              className={`chip ${filter === 'videos' ? 'active' : ''}`}
              onClick={() => setFilter('videos')}
            >
              <Film size={12} /> Videos
            </button>
            <button
              className={`chip ${filter === 'photos' ? 'active' : ''}`}
              onClick={() => setFilter('photos')}
            >
              <ImageIcon size={12} /> Photos
            </button>
          </div>

          <button
            className="picker-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> Upload New File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Media Grid */}
        <div className="picker-grid-scroll">
          {filtered.map((item) => {
            const isSelected = item.id === currentSelectedId;
            return (
              <div
                key={item.id}
                className={`picker-media-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  onSelectMedia(item);
                  onClose();
                }}
              >
                <div className="picker-thumb-wrapper">
                  {/* Ambient blurred backdrop for aesthetic full filling */}
                  {item.type === 'video' ? (
                    <video src={item.url} muted playsInline className="picker-thumb-blur" />
                  ) : (
                    <img src={item.url} alt="" className="picker-thumb-blur" />
                  )}

                  {/* Main uncropped full media */}
                  {item.type === 'video' ? (
                    <video src={item.url} muted playsInline className="picker-thumb-img" />
                  ) : (
                    <img src={item.url} alt="" className="picker-thumb-img" />
                  )}

                  <span className="picker-type-badge">
                    {item.type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
                    {item.type === 'video' ? 'Video' : 'Photo'}
                  </span>

                  {isSelected && (
                    <div className="picker-selected-check">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
