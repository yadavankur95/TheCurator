import { MemoryStory, MediaItem } from '../types';

export interface ExportProgress {
  percent: number;
  currentScene: number;
  totalScenes: number;
  statusText: string;
}

export interface ExportOptions {
  width?: number;
  height?: number;
  fps?: number;
  quality?: '1080p' | '720p';
  includeAudio?: boolean;
  onProgress?: (progress: ExportProgress) => void;
}

type CachedMedia =
  | { type: 'image'; element: HTMLImageElement; width: number; height: number }
  | { type: 'video'; element: HTMLVideoElement; width: number; height: number; duration: number };

export async function exportStoryAsVideo(
  story: MemoryStory,
  options: ExportOptions = {}
): Promise<Blob> {
  const { quality = '1080p', includeAudio = true, onProgress } = options;
  const width = quality === '1080p' ? 1920 : 1280;
  const height = quality === '1080p' ? 1080 : 720;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Preload and cache media elements (both images and videos)
  const mediaCache: Map<string, CachedMedia> = new Map();

  const preloadMedia = (item: MediaItem): Promise<CachedMedia> => {
    return new Promise((resolve) => {
      if (mediaCache.has(item.url)) {
        resolve(mediaCache.get(item.url)!);
        return;
      }

      if (item.type === 'video') {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        let resolved = false;
        const done = () => {
          if (resolved) return;
          resolved = true;
          const cached: CachedMedia = {
            type: 'video',
            element: video,
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720,
            duration: video.duration && !isNaN(video.duration) ? video.duration : 5,
          };
          mediaCache.set(item.url, cached);
          resolve(cached);
        };

        video.onloadeddata = done;
        video.oncanplay = done;
        video.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.src = item.url;
          const cached: CachedMedia = {
            type: 'image',
            element: fallbackImg,
            width: 1280,
            height: 720,
          };
          mediaCache.set(item.url, cached);
          resolve(cached);
        };

        video.src = item.url;
        video.load();

        // Timeout safety
        setTimeout(done, 4000);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const cached: CachedMedia = {
            type: 'image',
            element: img,
            width: img.naturalWidth || 1280,
            height: img.naturalHeight || 720,
          };
          mediaCache.set(item.url, cached);
          resolve(cached);
        };
        img.onerror = () => {
          const cached: CachedMedia = {
            type: 'image',
            element: img,
            width: 1280,
            height: 720,
          };
          mediaCache.set(item.url, cached);
          resolve(cached);
        };
        img.src = item.url;
      }
    });
  };

  onProgress?.({
    percent: 5,
    currentScene: 0,
    totalScenes: story.scenes.length,
    statusText: 'Loading and preparing photos & video clips...',
  });

  // Preload all media items
  const allMediaItems: MediaItem[] = [];
  story.scenes.forEach((s) => s.media.forEach((m) => allMediaItems.push(m)));
  await Promise.all(allMediaItems.map((m) => preloadMedia(m)));

  // Setup Web Audio synthesis node for export background melody
  let audioContext: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  if (includeAudio) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioCtx();
      audioDest = audioContext.createMediaStreamDestination();
    } catch {
      audioContext = null;
      audioDest = null;
    }
  }

  // Helper to play synthesized soft ambient chime chord
  const playExportChime = (chordIndex: number) => {
    if (!audioContext || !audioDest) return;
    try {
      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C Major
        [220.00, 261.63, 329.63, 440.00], // A Minor
        [174.61, 261.63, 349.23, 440.00], // F Major
        [196.00, 246.94, 293.66, 392.00], // G Major
      ];
      const chord = chords[chordIndex % chords.length];
      const now = audioContext.currentTime;

      chord.forEach((freq, idx) => {
        if (!audioContext || !audioDest) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 3.2);

        osc.connect(gain);
        gain.connect(audioDest);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 3.3);
      });
    } catch {
      // Audio fallback
    }
  };

  // Setup MediaStream from canvas + audio
  const canvasStream = canvas.captureStream(fps);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
    combinedTracks.push(...audioDest.stream.getAudioTracks());
  }

  const combinedStream = new MediaStream(combinedTracks);

  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: quality === '1080p' ? 6000000 : 3500000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const fullBlob = new Blob(chunks, { type: 'video/webm' });
      resolve(fullBlob);
    };
    mediaRecorder.onerror = (e) => reject(e);
  });

  mediaRecorder.start(200);

  // Helper to seek a video element to a specific timestamp frame
  const seekVideoFrame = (video: HTMLVideoElement, timeSec: number): Promise<void> => {
    return new Promise((resolve) => {
      const duration = video.duration && !isNaN(video.duration) ? video.duration : 10;
      const targetTime = Math.min(Math.max(0, timeSec % duration), Math.max(0, duration - 0.05));

      if (Math.abs(video.currentTime - targetTime) < 0.03) {
        resolve();
        return;
      }

      let done = false;
      const onSeeked = () => {
        if (done) return;
        done = true;
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };

      video.addEventListener('seeked', onSeeked);
      video.currentTime = targetTime;

      // Timeout safety so rendering never gets stuck on video seek
      setTimeout(onSeeked, 80);
    });
  };

  // Helper drawing functions
  const drawBackground = () => {
    ctx.fillStyle = '#141310';
    ctx.fillRect(0, 0, width, height);
  };

  const drawCoverMedia = (
    media: CachedMedia | undefined,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    scale = 1.0
  ) => {
    if (!media) {
      ctx.fillStyle = '#22201b';
      ctx.fillRect(dx, dy, dw, dh);
      return;
    }

    const mWidth = media.width || 1280;
    const mHeight = media.height || 720;
    const element = media.element;

    // 1. Draw soft blurred ambient background
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.filter = 'blur(16px)';
    ctx.drawImage(element, dx, dy, dw, dh);
    ctx.restore();

    // 2. Draw full uncropped media fitted inside bounds (contain mode)
    const mediaRatio = mWidth / mHeight;
    const destRatio = dw / dh;
    let renderW = dw;
    let renderH = dh;

    if (mediaRatio > destRatio) {
      renderW = dw;
      renderH = dw / mediaRatio;
    } else {
      renderH = dh;
      renderW = dh * mediaRatio;
    }

    const renderX = dx + (dw - renderW) / 2;
    const renderY = dy + (dh - renderH) / 2;

    ctx.save();
    ctx.translate(renderX + renderW / 2, renderY + renderH / 2);
    ctx.scale(scale, scale);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.drawImage(element, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();
  };

  const drawTextWrapped = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    font = 'bold 36px "Playfair Display", serif',
    color = '#ffffff',
    align: CanvasTextAlign = 'center'
  ) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;

    const lines = text.split('\n');
    let curY = y;
    lines.forEach((l) => {
      ctx.fillText(l, x, curY);
      curY += lineHeight;
    });
    ctx.shadowBlur = 0;
  };

  // Render each scene frame by frame
  const scenes = story.scenes;
  const totalScenes = scenes.length;

  for (let sceneIdx = 0; sceneIdx < totalScenes; sceneIdx++) {
    const scene = scenes[sceneIdx];
    
    // Check if any item in scene is a video
    const sceneCachedMedia = scene.media.map((m) => mediaCache.get(m.url));
    const hasVideo = sceneCachedMedia.some((m) => m?.type === 'video');

    // If video scene, allow full video duration up to 8s; otherwise 3.5s
    let sceneDurationSec = 3.5;
    if (hasVideo) {
      const firstVid = sceneCachedMedia.find((m) => m?.type === 'video');
      if (firstVid && firstVid.type === 'video' && firstVid.duration > 0) {
        sceneDurationSec = Math.min(10, Math.max(3.5, firstVid.duration));
      }
    }

    const totalFramesInScene = Math.round(sceneDurationSec * fps);

    // Play chord at scene start
    if (sceneIdx % 2 === 0) {
      playExportChime(sceneIdx);
    }

    for (let frame = 0; frame < totalFramesInScene; frame++) {
      const progressRatio = frame / totalFramesInScene;
      const currentTimeInSec = progressRatio * sceneDurationSec;
      const kenBurnsScale = 1.0 + progressRatio * 0.04;

      // Seek any videos in this scene to current playback timestamp
      for (const m of sceneCachedMedia) {
        if (m?.type === 'video') {
          await seekVideoFrame(m.element, currentTimeInSec);
        }
      }

      drawBackground();

      // Render based on layout
      switch (scene.layout) {
        case 'opening': {
          ctx.fillStyle = '#fbf8f2';
          ctx.fillRect(0, 0, width, height);

          const m0 = sceneCachedMedia[0];
          if (m0) {
            const frameW = width * 0.44;
            const frameH = height * 0.7;
            const frameX = width * 0.48;
            const frameY = height * 0.15;
            drawCoverMedia(m0, frameX, frameY, frameW, frameH, kenBurnsScale);
          }

          // Gold pill tag
          ctx.font = 'bold 16px "DM Sans", sans-serif';
          ctx.fillStyle = '#b89047';
          ctx.textAlign = 'left';
          ctx.fillText('✦ TWO BIRTHDAYS · MOTHER & DAUGHTER', width * 0.08, height * 0.35);

          // Opening Title
          drawTextWrapped(
            scene.text || 'Two Birthdays,\nOne Beautiful Story',
            width * 0.08,
            height * 0.45,
            width * 0.36,
            54,
            'bold 48px "Playfair Display", serif',
            '#1a1813',
            'left'
          );

          ctx.font = '20px "DM Sans", sans-serif';
          ctx.fillStyle = '#686355';
          ctx.fillText(scene.subtitle || 'Celebrating a shared bond on one special day', width * 0.08, height * 0.65);
          break;
        }

        case 'video-focus':
        case 'portrait': {
          const m0 = sceneCachedMedia[0];
          if (m0) {
            drawCoverMedia(m0, 0, 0, width, height, kenBurnsScale);
          }

          if (scene.caption || scene.text) {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, height * 0.82, width, height * 0.18);
            drawTextWrapped(
              scene.caption || scene.text || '',
              width / 2,
              height * 0.9,
              width * 0.8,
              36,
              'bold 28px "Playfair Display", serif',
              '#ffffff',
              'center'
            );
          }
          break;
        }

        case 'pair': {
          const m0 = sceneCachedMedia[0];
          const m1 = sceneCachedMedia[1];
          const gap = 30;
          const cardW = (width - gap * 3) / 2;
          const cardH = height * 0.72;
          const cardY = height * 0.12;

          if (m0) drawCoverMedia(m0, gap, cardY, cardW, cardH, kenBurnsScale);
          if (m1) drawCoverMedia(m1, gap * 2 + cardW, cardY, cardW, cardH, kenBurnsScale);

          if (scene.caption) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(width * 0.2, height * 0.88, width * 0.6, 50);
            drawTextWrapped(scene.caption, width / 2, height * 0.915, width * 0.55, 30, 'italic 20px "Playfair Display", serif', '#ffffff', 'center');
          }
          break;
        }

        case 'trio': {
          const gap = 20;
          const cardW = (width - gap * 4) / 3;
          const cardH = height * 0.72;
          const cardY = height * 0.12;

          for (let i = 0; i < 3; i++) {
            const m = sceneCachedMedia[i];
            const x = gap + i * (cardW + gap);
            if (m) drawCoverMedia(m, x, cardY, cardW, cardH, kenBurnsScale);
          }

          if (scene.caption) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(width * 0.2, height * 0.88, width * 0.6, 50);
            drawTextWrapped(scene.caption, width / 2, height * 0.915, width * 0.55, 30, 'italic 20px "Playfair Display", serif', '#ffffff', 'center');
          }
          break;
        }

        case 'collage':
        case 'mosaic': {
          const gap = 16;
          const colW = (width - gap * 3) / 2;
          const rowH = (height - gap * 3) / 2;

          for (let i = 0; i < 4; i++) {
            const m = sceneCachedMedia[i];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = gap + col * (colW + gap);
            const y = gap + row * (rowH + gap);
            if (m) drawCoverMedia(m, x, y, colW, rowH, kenBurnsScale);
          }
          break;
        }

        case 'quote': {
          const m0 = sceneCachedMedia[0];
          if (m0) {
            drawCoverMedia(m0, 0, 0, width, height, kenBurnsScale);
            ctx.fillStyle = 'rgba(18, 16, 12, 0.7)';
            ctx.fillRect(0, 0, width, height);
          }
          // Quote mark
          ctx.font = 'bold 90px "Playfair Display", serif';
          ctx.fillStyle = '#e6c887';
          ctx.textAlign = 'center';
          ctx.fillText('“', width / 2, height * 0.38);

          // Quote body
          drawTextWrapped(
            scene.text || 'Two Birthdays, Countless Memories',
            width / 2,
            height * 0.48,
            width * 0.7,
            50,
            'italic 38px "Playfair Display", serif',
            '#ffffff',
            'center'
          );

          if (scene.quoteAuthor) {
            ctx.font = 'bold 18px "DM Sans", sans-serif';
            ctx.fillStyle = '#e6c887';
            ctx.fillText(`— ${scene.quoteAuthor}`, width / 2, height * 0.72);
          }
          break;
        }

        case 'ending': {
          const m0 = sceneCachedMedia[0];
          if (m0) {
            drawCoverMedia(m0, 0, 0, width, height, kenBurnsScale);
            ctx.fillStyle = 'rgba(18, 16, 12, 0.75)';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.font = 'bold 16px "DM Sans", sans-serif';
          ctx.fillStyle = '#e6c887';
          ctx.textAlign = 'center';
          ctx.fillText('✦ HAPPY SHARED BIRTHDAY ✦', width / 2, height * 0.38);

          drawTextWrapped(
            scene.text || 'Happy Birthday to my two favourite people.',
            width / 2,
            height * 0.48,
            width * 0.8,
            56,
            'bold 46px "Playfair Display", serif',
            '#ffffff',
            'center'
          );
          break;
        }

        case 'full':
        default: {
          const m0 = sceneCachedMedia[0];
          if (m0) {
            drawCoverMedia(m0, 0, 0, width, height, kenBurnsScale);
          }
          break;
        }
      }

      // Allow event loop to breathe between frames for smooth rendering
      await new Promise((r) => setTimeout(r, 1000 / fps));
    }

    const currentPercent = Math.min(95, Math.round(10 + ((sceneIdx + 1) / totalScenes) * 85));
    onProgress?.({
      percent: currentPercent,
      currentScene: sceneIdx + 1,
      totalScenes,
      statusText: `Rendering scene ${sceneIdx + 1} of ${totalScenes}...`,
    });
  }

  onProgress?.({
    percent: 98,
    currentScene: totalScenes,
    totalScenes,
    statusText: 'Encoding final video file with audio...',
  });

  mediaRecorder.stop();
  const videoBlob = await recordingPromise;

  if (audioContext && audioContext.state !== 'closed') {
    try {
      audioContext.close();
    } catch {
      // ignore
    }
  }

  onProgress?.({
    percent: 100,
    currentScene: totalScenes,
    totalScenes,
    statusText: 'Video export ready!',
  });

  return videoBlob;
}

