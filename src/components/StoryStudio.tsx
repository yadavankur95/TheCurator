import { useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  Grid,
  HardDriveDownload,
  Heart,
  Layout as LayoutIcon,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  Clock,
  ChevronUp,
  ChevronDown,
  Play,
  Replace,
  Layers,
  X,
  Upload,
} from 'lucide-react';
import { BirthdayQuote, EventType, Layout, MediaItem, MemoryStory, Scene } from '../types';
import { EVENT_PRESETS, getEventPreset } from '../data/quotes';
import { QuoteModal } from './QuoteModal';
import { ExportVideoModal } from './ExportVideoModal';
import { MediaPickerModal } from './MediaPickerModal';

interface StoryStudioProps {
  story: MemoryStory;
  allMedia: MediaItem[];
  onUpdateStory: (updated: MemoryStory) => void;
  onChangeEventType: (eventType: EventType) => void;
  onBack: () => void;
  onPlay: () => void;
}

const LAYOUT_OPTIONS: { id: Layout; label: string; desc: string }[] = [
  { id: 'opening', label: 'Opening Hero', desc: 'Title banner with flagship moment' },
  { id: 'full', label: 'Cinematic Full', desc: 'Single immersive photo or video' },
  { id: 'pair', label: 'Duo Comparison', desc: 'Side-by-side mother & daughter moments' },
  { id: 'trio', label: 'Trio Harmony', desc: 'Three photos in a balanced row' },
  { id: 'collage', label: 'Quad Collage', desc: 'Four photos in an artistic grid' },
  { id: 'mosaic', label: 'Memory Mosaic', desc: '5-6 photos in a magazine-style wall' },
  { id: 'quote', label: 'Heartfelt Quote', desc: 'Inspirational Mother-Daughter quote' },
  { id: 'portrait', label: 'Editorial Portrait', desc: 'Centered with poetic words' },
  { id: 'video-focus', label: 'Video Spotlight', desc: 'Optimized for living video memory' },
  { id: 'ending', label: 'Grand Finale', desc: 'Celebration wishes & closing words' },
];

export function StoryStudio({
  story,
  allMedia,
  onUpdateStory,
  onChangeEventType,
  onBack,
  onPlay,
}: StoryStudioProps) {
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeQuoteSceneIndex, setActiveQuoteSceneIndex] = useState<number | null>(null);

  // State for media replacement or addition
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    sceneIndex: number;
    mediaIndex?: number; // if defined, we are replacing; if undefined, we are adding to scene
  } | null>(null);

  const currentEvent = getEventPreset(story.eventType || 'mother-daughter-birthday');

  const handleUpdateScene = (index: number, updates: Partial<Scene>) => {
    const updatedScenes = [...story.scenes];
    updatedScenes[index] = { ...updatedScenes[index], ...updates };
    onUpdateStory({
      ...story,
      scenes: updatedScenes,
    });
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= story.scenes.length) return;
    const updatedScenes = [...story.scenes];
    const temp = updatedScenes[index];
    updatedScenes[index] = updatedScenes[newIdx];
    updatedScenes[newIdx] = temp;
    onUpdateStory({
      ...story,
      scenes: updatedScenes,
    });
  };

  const handleDeleteScene = (index: number) => {
    if (story.scenes.length <= 1) return;
    const updatedScenes = story.scenes.filter((_, i) => i !== index);
    onUpdateStory({
      ...story,
      scenes: updatedScenes,
    });
  };

  const handleAddNewScene = () => {
    const fallbackMedia = allMedia[0] || story.scenes[0]?.media[0];
    const newScene: Scene = {
      id: `scene-custom-${Date.now()}`,
      layout: 'full',
      media: fallbackMedia ? [fallbackMedia] : [],
      text: 'One date. Two birthdays. Countless memories.',
      duration: 6000,
    };
    const updated = [...story.scenes, newScene];
    onUpdateStory({
      ...story,
      scenes: updated,
    });
    setEditingSceneIndex(updated.length - 1);
  };

  // Media Operations per Scene
  const handleRemoveMediaFromScene = (sceneIdx: number, mediaIdx: number) => {
    const scene = story.scenes[sceneIdx];
    if (scene.media.length <= 1) {
      alert('A scene must contain at least one photo or video. To remove the whole scene, use the trash icon on the top right.');
      return;
    }
    const updatedMedia = scene.media.filter((_, i) => i !== mediaIdx);
    handleUpdateScene(sceneIdx, { media: updatedMedia });
  };

  const handleMediaPickerSelect = (selectedItem: MediaItem) => {
    if (!pickerState) return;
    const { sceneIndex, mediaIndex } = pickerState;
    const scene = story.scenes[sceneIndex];

    if (mediaIndex !== undefined) {
      // REPLACE MEDIA at exact index
      const updatedMedia = [...scene.media];
      updatedMedia[mediaIndex] = selectedItem;
      handleUpdateScene(sceneIndex, { media: updatedMedia });
    } else {
      // ADD MEDIA to scene
      const updatedMedia = [...scene.media, selectedItem];
      // Automatically adjust layout if needed
      let layout = scene.layout;
      if (layout === 'full' && updatedMedia.length === 2) layout = 'pair';
      if (layout === 'pair' && updatedMedia.length === 3) layout = 'trio';
      if (layout === 'trio' && updatedMedia.length >= 4) layout = 'collage';
      handleUpdateScene(sceneIndex, { media: updatedMedia, layout });
    }
    setPickerState(null);
  };

  const handleSelectQuoteForScene = (quote: BirthdayQuote) => {
    if (activeQuoteSceneIndex !== null) {
      handleUpdateScene(activeQuoteSceneIndex, {
        text: quote.text,
        quoteAuthor: quote.author,
      });
    }
  };

  return (
    <div className="studio-container">
      {/* Studio Header */}
      <header className="studio-header">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Website
        </button>

        <div className="studio-title-block">
          <span className="eyebrow">Story Studio & Director</span>
          <h1>Customize Your Slideshow & Scenes</h1>
          <p>{story.scenes.length} Scenes · {story.totalMediaCount} Total Media Items Handled</p>
        </div>

        <div className="studio-header-actions">
          <button className="header-btn-export" onClick={() => setIsExportModalOpen(true)}>
            <HardDriveDownload size={15} /> Export Video
          </button>
          <button className="play-button" onClick={onPlay}>
            <Play size={16} fill="currentColor" /> Play Slideshow
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="studio-workspace">
        {/* Event / Celebration Mode Picker */}
        <div className="studio-event-selector-card">
          <div className="event-selector-header">
            <div>
              <span className="eyebrow">Celebration Theme & Event Type</span>
              <h3>Current Event: <span style={{ color: currentEvent.accentColor }}>{currentEvent.title}</span></h3>
              <p>{currentEvent.description}</p>
            </div>
          </div>

          <div className="event-pills-row">
            {EVENT_PRESETS.map((preset) => {
              const isCurrent = (story.eventType || 'mother-daughter-birthday') === preset.id;
              return (
                <button
                  key={preset.id}
                  className={`event-choice-pill ${isCurrent ? 'active' : ''}`}
                  onClick={() => onChangeEventType(preset.id)}
                  style={{
                    borderColor: isCurrent ? preset.accentColor : undefined,
                  }}
                >
                  <span className="pill-badge">{preset.badge}</span>
                  <strong>{preset.title}</strong>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Controls: Add Scene Button */}
        <div className="studio-top-bar-actions">
          <h3>Scenes Storyboard ({story.scenes.length})</h3>
          <button className="btn-add-scene-hero" onClick={handleAddNewScene}>
            <Plus size={16} /> Add New Scene
          </button>
        </div>

        {/* Scenes List */}
        <div className="scenes-list">
          {story.scenes.map((scene, idx) => {
            const isEditing = editingSceneIndex === idx;
            return (
              <div key={scene.id} className={`studio-scene-item ${isEditing ? 'expanded' : ''}`}>
                <div className="scene-item-header">
                  <div className="scene-meta-left">
                    <span className="scene-index-badge">Scene {idx + 1}</span>
                    <span className="layout-badge">{scene.layout.toUpperCase()}</span>
                    <span className="media-count-badge">{scene.media.length} media item{scene.media.length > 1 ? 's' : ''}</span>
                    {scene.chapterTitle && <span className="chapter-badge">{scene.chapterTitle}</span>}
                  </div>

                  <div className="scene-item-controls">
                    <button
                      className="ctrl-icon-btn"
                      onClick={() => handleMoveScene(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      className="ctrl-icon-btn"
                      onClick={() => handleMoveScene(idx, 'down')}
                      disabled={idx === story.scenes.length - 1}
                      title="Move Down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      className={`ctrl-icon-btn ${isEditing ? 'active' : ''}`}
                      onClick={() => setEditingSceneIndex(isEditing ? null : idx)}
                      title="Edit Scene Details & Layout"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="ctrl-icon-btn delete"
                      onClick={() => handleDeleteScene(idx)}
                      disabled={story.scenes.length <= 1}
                      title="Delete Entire Scene"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Media Cards in this Scene (Supports Replace, Delete, and Add) */}
                <div className="scene-media-management-row">
                  <div className="scene-media-thumbnails">
                    {scene.media.map((m, mIdx) => (
                      <div key={m.id || mIdx} className="thumb-box-managed">
                        {m.type === 'video' ? (
                          <video src={m.url} className="thumb-img" muted playsInline />
                        ) : (
                          <img src={m.url} alt={m.alt} className="thumb-img" />
                        )}
                        <span className="thumb-type">{m.type}</span>

                        {/* Hover Overlay with Replace and Delete Actions */}
                        <div className="thumb-action-overlay">
                          <button
                            type="button"
                            className="thumb-btn replace"
                            onClick={() =>
                              setPickerState({
                                isOpen: true,
                                sceneIndex: idx,
                                mediaIndex: mIdx,
                              })
                            }
                            title="Replace this photo/video"
                          >
                            <Replace size={13} />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            className="thumb-btn delete"
                            onClick={() => handleRemoveMediaFromScene(idx, mIdx)}
                            title="Remove from this scene"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* "+ Add Media to Scene" Button */}
                    <button
                      type="button"
                      className="thumb-add-media-slot"
                      onClick={() =>
                        setPickerState({
                          isOpen: true,
                          sceneIndex: idx,
                          mediaIndex: undefined,
                        })
                      }
                      title="Add another photo or video to this scene"
                    >
                      <Plus size={20} />
                      <span>Add Media</span>
                    </button>
                  </div>

                  {scene.text && (
                    <div className="scene-text-snippet">
                      <Quote size={14} className="snippet-icon" />
                      <p>{scene.text}</p>
                    </div>
                  )}
                </div>

                {/* Expanded scene editor */}
                {isEditing && (
                  <div className="scene-editor-panel">
                    <div className="editor-grid">
                      <div className="editor-group">
                        <label className="editor-label">Scene Layout Style</label>
                        <select
                          value={scene.layout}
                          onChange={(e) => handleUpdateScene(idx, { layout: e.target.value as Layout })}
                          className="editor-select"
                        >
                          {LAYOUT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label} — {opt.desc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="editor-group">
                        <label className="editor-label">Display Duration (Seconds)</label>
                        <input
                          type="number"
                          min="3"
                          max="30"
                          value={Math.round(scene.duration / 1000)}
                          onChange={(e) =>
                            handleUpdateScene(idx, { duration: Math.max(3000, Number(e.target.value) * 1000) })
                          }
                          className="editor-input"
                        />
                      </div>
                    </div>

                    <div className="editor-group full-width">
                      <div className="label-with-action">
                        <label className="editor-label">Scene Caption / Quote</label>
                        <button
                          type="button"
                          className="quote-picker-link"
                          onClick={() => {
                            setActiveQuoteSceneIndex(idx);
                            setIsQuoteModalOpen(true);
                          }}
                        >
                          <Sparkles size={14} /> Browse & Pick Curated Quote for {currentEvent.shortName}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={scene.text || ''}
                        onChange={(e) => handleUpdateScene(idx, { text: e.target.value })}
                        placeholder="Enter heartwarming quote or memory caption..."
                        className="editor-textarea"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setActiveQuoteSceneIndex(null);
        }}
        onSelectQuote={handleSelectQuoteForScene}
        currentQuoteText={activeQuoteSceneIndex !== null ? story.scenes[activeQuoteSceneIndex]?.text : undefined}
      />

      {/* Media Picker Modal (For Replacing or Adding to a Scene) */}
      {pickerState && (
        <MediaPickerModal
          isOpen={pickerState.isOpen}
          onClose={() => setPickerState(null)}
          allMedia={allMedia}
          currentSelectedId={
            pickerState.mediaIndex !== undefined
              ? story.scenes[pickerState.sceneIndex]?.media[pickerState.mediaIndex]?.id
              : undefined
          }
          title={
            pickerState.mediaIndex !== undefined
              ? `Replace Media in Scene ${pickerState.sceneIndex + 1}`
              : `Add Media to Scene ${pickerState.sceneIndex + 1}`
          }
          onSelectMedia={handleMediaPickerSelect}
        />
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
