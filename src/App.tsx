import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CircleUserRound,
  CloudUpload,
  FolderUp,
  Image as ImageIcon,
  Menu,
  Sparkles,
  // Unused icons removed: Heart, Play, RotateCcw, Sliders, Video
} from 'lucide-react';
import { MediaItem, MemoryStory, ThemeStyle, View, EventType } from './types';
import { generateComprehensiveStory } from './utils/storyGenerator';
import { MemoryWebsite } from './components/MemoryWebsite';
import { SlideshowPlayer } from './components/SlideshowPlayer';
import { StoryStudio } from './components/StoryStudio';
import { loadMedia, saveMedia, loadStory, saveStory, revokeAllMediaUrls } from './persistence';



const demoImages = [
  'https://images.pexels.com/photos/7328125/pexels-photo-7328125.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/8157919/pexels-photo-8157919.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/38645109/pexels-photo-38645109.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/38472161/pexels-photo-38472161.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/17814401/pexels-photo-17814401.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/7180199/pexels-photo-7180199.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/33832740/pexels-photo-33832740.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1445704/pexels-photo-1445704.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/4145150/pexels-photo-4145150.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/3771639/pexels-photo-3771639.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2253879/pexels-photo-2253879.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1684189/pexels-photo-1684189.jpeg?auto=compress&cs=tinysrgb&w=1600',
];

const demoCaptions = [
  'Mother and daughter sharing a joyful birthday moment',
  'Dancing under the summer sun with endless laughter',
  'Blowing out shared birthday candles on our double cake',
  'Family birthday celebration surrounded by warm balloons',
  'Mother and daughter among vibrant garden blossoms',
  'Holding hands and walking down memory lane together',
  'Matching smiles on the happiest day of the year',
  'A warm embrace celebrating another year of shared grace',
  'Baking birthday treats together in the kitchen',
  'Sharing sweet secrets and unforgettable giggles',
  'Watching fireworks illuminate our special night',
  'Golden hour walks filled with stories and memories',
  'Tender morning hugs on our shared birthday',
  'Mother’s gentle guidance and daughter’s sparkling eyes',
  'Double the wishes whispered upon birthday stars',
  'Forever twinned in heart, date, and unconditional love',
];

const createDemoMedia = (index: number): MediaItem => {
  const url = demoImages[index % demoImages.length];
  const alt = demoCaptions[index % demoCaptions.length];
  const isVideo = index === 3 || index === 7 || index === 11 || index === 15;
  const portrait = index % 3 === 0;

  return {
    id: `demo-${index}-${Date.now()}`,
    type: isVideo ? 'video' : 'image',
    url,
    thumbnail: url,
    name: `Memory_${index + 1}.${isVideo ? 'mp4' : 'jpg'}`,
    width: portrait ? 1080 : 1920,
    height: portrait ? 1920 : 1080,
    orientation: portrait ? 'portrait' : 'landscape',
    date: `June ${10 + (index % 15)}, 2024`,
    duration: isVideo ? 8 : undefined,
    qualityScore: 0.95 - (index % 10) * 0.02,
    selected: true,
    isFavorite: index % 4 === 0,
    alt,
  };
};

const initialDemoCollection: MediaItem[] = Array.from({ length: 24 }, (_, i) => createDemoMedia(i));

export default function App() {
  const [view, setView] = useState<View>('website');
  const [media, setMedia] = useState<MediaItem[]>(initialDemoCollection);
  const [eventType, setEventType] = useState<EventType>('mother-daughter-birthday');
  const [variation, setVariation] = useState(0);
  const [theme, setTheme] = useState<ThemeStyle>('Birthday');
  const [isDragging, setIsDragging] = useState(false);
  const [playerStartIndex, setPlayerStartIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; done: number } | null>(null);


  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Persist media whenever it changes
  useEffect(() => {
    saveMedia(media);
  }, [media]);



  const [story, setStory] = useState<MemoryStory>(() => {
    // If persisted story is loaded above, this initializer will be overridden
    return generateComprehensiveStory(initialDemoCollection, { variation: 0, theme: 'Birthday', eventType: 'mother-daughter-birthday' });
  });






  const imageCount = useMemo(() => media.filter((m) => m.type === 'image').length, [media]);
  const videoCount = useMemo(() => media.filter((m) => m.type === 'video').length, [media]);

  // Persist story whenever it changes
  useEffect(() => {
    if (story) saveStory(story);
  }, [story]);

  // Read video durations and metadata accurately when files are uploaded
  useEffect(() => {
    const pending = media.filter((item) => item.type === 'video' && item.duration === undefined);
    if (!pending.length) return;

    const cleanups: (() => void)[] = [];
    pending.forEach((item) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = item.url;
      const onLoaded = () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 6;
        setMedia((prev) =>
          prev.map((m) =>
            m.id !== item.id
              ? m
              : {
                  ...m,
                  duration,
                  width: video.videoWidth || m.width,
                  height: video.videoHeight || m.height,
                  orientation:
                    video.videoWidth && video.videoHeight
                      ? video.videoWidth >= video.videoHeight
                        ? 'landscape'
                        : 'portrait'
                      : m.orientation,
                }
          )
        );
      };
      const onError = () => {
        setMedia((prev) => prev.map((m) => (m.id !== item.id ? m : { ...m, duration: 6 })));
      };
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onError);
      cleanups.push(() => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [media]);

  // Handle file uploads (works seamlessly for 120+ images and videos)
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploadProgress({ total: fileArray.length, done: 0 });
    setView('processing');

    const nextMedia: MediaItem[] = fileArray.map((file, index) => {
      const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm|avi)$/i) !== null;
      const url = URL.createObjectURL(file);
      const isPortrait = index % 3 === 0;

      const item: MediaItem = {
        id: `upload-${index}-${Date.now()}-${file.name}`,
        type: isVideo ? 'video' : 'image',
        url,
        thumbnail: url,
        name: file.name,
        width: isPortrait ? 1080 : 1920,
        height: isPortrait ? 1920 : 1080,
        orientation: isPortrait ? 'portrait' : 'landscape',
        date: file.lastModified ? new Date(file.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'June 14, 2024',
        duration: isVideo ? 8 : undefined,
        qualityScore: 0.95 - (index % 20) * 0.01,
        selected: true,
        alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      } as MediaItem;
      // Attach the original Blob for persistence
      (item as any).file = file;
      return item;
    });


    setMedia(nextMedia);

    // Simulate analysis & smart grouping
    window.setTimeout(() => {
      const generated = generateComprehensiveStory(nextMedia, {
        variation,
        theme,
      });
      setStory(generated);
      setView('website');
      setUploadProgress(null);
    }, 2800);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const changeEventType = (newEvent: EventType) => {
    setEventType(newEvent);
    const updated = generateComprehensiveStory(media, {
      variation,
      theme,
      eventType: newEvent,
    });
    setStory(updated);
  };

  const regenerateStory = () => {
    const nextVariation = variation + 1;
    setVariation(nextVariation);
    const updated = generateComprehensiveStory(media, {
      variation: nextVariation,
      theme,
      eventType,
    });
    setStory(updated);
  };

  const openPlayer = (startIndex = 0) => {
    setPlayerStartIndex(startIndex);
    setView('player');
  };

  // Render view
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden-file-input"
        onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error directory upload attribute
        webkitdirectory=""
        directory=""
        multiple
        className="hidden-file-input"
        onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
      />

      {view === 'processing' && (
        <ProcessingScreen totalItems={uploadProgress?.total || media.length} />
      )}

      {view === 'player' && (
        <SlideshowPlayer
          story={story}
          initialSceneIndex={playerStartIndex}
          onExit={() => setView('website')}
          onOpenStudio={() => setView('studio')}
        />
      )}

      {view === 'studio' && (
        <StoryStudio
          story={story}
          allMedia={media}
          onUpdateStory={setStory}
          onChangeEventType={changeEventType}
          onBack={() => setView('website')}
          onPlay={() => openPlayer(0)}
        />
      )}

      {view === 'website' && (
        <MemoryWebsite
          story={story}
          allMedia={media}
          onPlaySlideshow={openPlayer}
          onOpenStudio={() => setView('studio')}
          onUploadMore={() => fileInputRef.current?.click()}
          onRegenerate={regenerateStory}
          onChangeEventType={changeEventType}
          onUpdateStory={setStory}
        />
      )}

      {view === 'create' && (
        <div className="app-shell">
          <header className="site-header">
            <button className="wordmark" onClick={() => setView('website')}>
              The Curator
            </button>
            <nav className="desktop-nav">
              <button className="nav-text-btn" onClick={() => setView('website')}>
                Memory Website
              </button>
              <button className="nav-text-btn" onClick={() => openPlayer(0)}>
                Play Slideshow
              </button>
              <CircleUserRound size={21} strokeWidth={1.8} />
            </nav>
            <button className="mobile-menu" aria-label="Open menu">
              <Menu size={22} />
            </button>
          </header>

          <main className="create-main">
            <section className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={13} className="inline-icon" /> Mother & Daughter Shared Birthday
              </span>
              <h1>
                Turn all your memories<br className="desktop-break" /> into one beautiful story.
              </h1>
              <p>
                Drop all your photos and videos (10, 50, 120+ files). We’ll generate an interactive website, themed chapters, and a cinematic slideshow celebrating your shared birthday.
              </p>
            </section>

            <div
              className={`drop-zone ${isDragging ? 'is-dragging' : ''}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-mark">
                <CloudUpload size={34} strokeWidth={1.5} />
              </div>

              <h2>{isDragging ? 'Release to begin organizing' : 'Drop all 120+ photos & videos here'}</h2>

              <div className="choose-buttons-row">
                <button
                  type="button"
                  className="btn-select-files"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <ImageIcon size={16} /> Select Media Files
                </button>
                <button
                  type="button"
                  className="btn-select-folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                >
                  <FolderUp size={16} /> Upload Entire Folder
                </button>
              </div>

              <div className="media-count">
                <ImageIcon size={16} strokeWidth={1.8} />
                {imageCount} photos · {videoCount} videos ready
              </div>
              <div className="drop-hint">Supports unlimited JPG, PNG, HEIC, MP4, MOV videos and photos</div>
            </div>

            <div className="quick-switch-row">
              <button className="quick-view-link" onClick={() => setView('website')}>
                Or explore current collection on Website →
              </button>
            </div>

            <div className="privacy-note">
              <span className="tiny-dot" /> Your memories are processed privately in your browser.
            </div>
          </main>

          <footer className="create-footer">
            <span>Two Birthdays, One Beautiful Story · Mother & Daughter Edition</span>
            <span>Private & Instant</span>
          </footer>
        </div>
      )}
    </>
  );
}

function ProcessingScreen({ totalItems }: { totalItems: number }) {
  const steps = [
    `Analyzing all ${totalItems} photos & video moments`,
    'Detecting mother & daughter shared birthday memories',
    'Curating video highlights and syncing audio timing',
    'Selecting heartfelt birthday quotes & tributes',
    'Crafting dynamic layouts (Pairs, Collages, Mosaics, Videos)',
    'Assembling interactive website & slideshow chapters',
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((step) => Math.min(step + 1, steps.length - 1));
    }, 450);
    return () => window.clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="processing-screen">
      <div className="processing-orbit orbit-one" />
      <div className="processing-orbit orbit-two" />
      <div className="processing-content">
        <span className="eyebrow">
          <Sparkles size={14} className="inline-icon" /> The Curator is at work
        </span>
        <h1>
          Creating your<br />
          <em>Mother & Daughter Story...</em>
        </h1>
        <div className="processing-list">
          {steps.map((step, index) => (
            <div className={index <= active ? 'step done' : 'step'} key={step}>
              <span>{index <= active ? <Check size={13} /> : <span className="step-dot" />}</span>
              {step}
            </div>
          ))}
        </div>
        <div className="processing-footer">
          <Sparkles size={15} /> Organizing all {totalItems} moments with love & grace
        </div>
      </div>
    </div>
  );
}

