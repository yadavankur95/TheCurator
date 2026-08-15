import { useState } from 'react';
import {
  Download,
  Film,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Play,
  Share2,
  HardDriveDownload,
  Clock,
} from 'lucide-react';
import { MemoryStory } from '../types';
import { exportStoryAsVideo, ExportProgress } from '../utils/videoExporter';

interface ExportVideoModalProps {
  story: MemoryStory;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportVideoModal({ story, isOpen, onClose }: ExportVideoModalProps) {
  const [quality, setQuality] = useState<'1080p' | '720p'>('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    setExportedVideoUrl(null);

    try {
      const blob = await exportStoryAsVideo(story, {
        quality,
        onProgress: (p) => setProgress(p),
      });

      const url = URL.createObjectURL(blob);
      setExportedVideoUrl(url);

      // Trigger automatic direct file download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mother_Daughter_Birthday_Story_${quality}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error('Export error:', err);
      setErrorMsg('Export was interrupted or blocked. You can retry with 720p or fewer scenes.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="export-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <span className="eyebrow">
              <Film size={13} className="inline-icon" /> Video Exporter
            </span>
            <h2>Export Memory Slideshow as Video</h2>
            <p>
              Render all {story.scenes.length} scenes & quotes into a high-definition video file you can keep forever or share.
            </p>
          </div>
          <button className="glass-icon-button" onClick={onClose} disabled={isExporting}>
            <X size={20} />
          </button>
        </div>

        {/* Quality Selector & Stats */}
        {!isExporting && !exportedVideoUrl && (
          <div className="export-settings-content">
            <div className="export-quality-picker">
              <label className="export-label">Select Video Resolution</label>
              <div className="quality-options-grid">
                <div
                  className={`quality-card ${quality === '1080p' ? 'active' : ''}`}
                  onClick={() => setQuality('1080p')}
                >
                  <div className="quality-badge">Full HD</div>
                  <h4>1080p (1920 × 1080)</h4>
                  <p>Crisp presentation for TV, iPad, and large screens.</p>
                </div>
                <div
                  className={`quality-card ${quality === '720p' ? 'active' : ''}`}
                  onClick={() => setQuality('720p')}
                >
                  <div className="quality-badge">Standard HD</div>
                  <h4>720p (1280 × 720)</h4>
                  <p>Faster rendering, perfect for sharing on WhatsApp or mobile.</p>
                </div>
              </div>
            </div>

            <div className="export-summary-box">
              <div className="summary-row">
                <span>Total Scenes in Video:</span>
                <strong>{story.scenes.length} Scenes</strong>
              </div>
              <div className="summary-row">
                <span>Total Memories Handled:</span>
                <strong>{story.totalMediaCount} Photos & Videos</strong>
              </div>
              <div className="summary-row">
                <span>Theme & Quotes:</span>
                <strong>Mother & Daughter Shared Birthday</strong>
              </div>
            </div>

            <div className="export-action-footer">
              <button className="cta-start-export" onClick={handleStartExport}>
                <HardDriveDownload size={18} /> Start Video Export & Download
              </button>
            </div>
          </div>
        )}

        {/* Live Progress Bar during export */}
        {isExporting && (
          <div className="export-rendering-state">
            <div className="rendering-spinner-box">
              <Film size={36} className="render-icon-spin" />
              <div className="percent-text">{progress?.percent || 0}%</div>
            </div>
            <h3>Generating Birthday Video...</h3>
            <p className="render-status-sub">{progress?.statusText || 'Rendering frames...'}</p>

            <div className="export-progress-bar-wrap">
              <div
                className="export-progress-bar-fill"
                style={{ width: `${progress?.percent || 0}%` }}
              />
            </div>
            <span className="progress-scene-tag">
              Scene {progress?.currentScene || 1} of {progress?.totalScenes || story.scenes.length}
            </span>
          </div>
        )}

        {/* Video Ready State */}
        {exportedVideoUrl && (
          <div className="export-success-state">
            <div className="success-icon-wrap">
              <CheckCircle2 size={40} className="success-check-icon" />
            </div>
            <h3>Your Video Is Ready!</h3>
            <p>Your video was automatically downloaded to your downloads folder.</p>

            <div className="exported-video-preview">
              <video src={exportedVideoUrl} controls autoPlay playsInline className="preview-video-player" />
            </div>

            <div className="success-actions-row">
              <a
                href={exportedVideoUrl}
                download={`Mother_Daughter_Birthday_Story_${quality}.webm`}
                className="cta-download-again"
              >
                <Download size={16} /> Download Video Again
              </a>
              <button className="btn-close-export" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className="export-error-box">
            <AlertCircle size={20} color="#e11d48" />
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
