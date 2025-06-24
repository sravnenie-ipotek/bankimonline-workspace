import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { Modal } from '@src/components/ui/Modal';
import styles from './videoPlayerModal.module.scss';

const cx = classNames.bind(styles);

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Action #1: Back 10 seconds
  const handleSkipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  // Action #2: Play/Pause toggle
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Action #3: Forward 10 seconds
  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  // Action #4: Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Action #5: Time display (handled in render)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Action #6: Progress bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  // Action #7: Fullscreen toggle
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Action #8: Close modal
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Auto-hide controls functionality
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Keyboard controls
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        handlePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleSkipBackward();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSkipForward();
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
      case 'KeyF':
        e.preventDefault();
        handleFullscreen();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      resetControlsTimeout();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, isPlaying]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) {
    return null;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Modal isVisible={isOpen} onCancel={handleClose} className={cx('video-modal')}>
      <div 
        className={cx('video-container')} 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className={cx('video-player')}
          src={videoSrc}
          autoPlay
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onClick={handlePlayPause}
        >
          Your browser does not support the video tag.
        </video>

        {/* Action #8: Close button */}
        <button className={cx('close-button')} onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Video Controls */}
        <div className={cx('controls', { 'controls--hidden': !showControls })}>
          {/* Bottom gradient overlay */}
          <div className={cx('controls-overlay')} />
          
          {/* Action #6: Progress bar */}
          <div className={cx('progress-container')}>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={handleProgressChange}
              className={cx('progress-bar')}
            />
          </div>

          <div className={cx('controls-bottom')}>
            <div className={cx('controls-left')}>
              {/* Action #1: Back 10 seconds */}
              <button className={cx('control-button')} onClick={handleSkipBackward}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Action #2: Play/Pause */}
              <button className={cx('control-button', 'play-button')} onClick={handlePlayPause}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" fill="white"/>
                    <rect x="14" y="4" width="4" height="16" fill="white"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon points="5,3 19,12 5,21" fill="white"/>
                  </svg>
                )}
              </button>

              {/* Action #3: Forward 10 seconds */}
              <button className={cx('control-button')} onClick={handleSkipForward}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Action #4: Volume control */}
              <div className={cx('volume-container')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white"/>
                  <path d="M19.07 4.93A10 10 0 0 1 19.07 19.07M15.54 8.46A5 5 0 0 1 15.54 15.54" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className={cx('volume-slider')}
                />
              </div>

              {/* Action #5: Time display */}
              <div className={cx('time-display')}>
                {formatTime(currentTime)}/{formatTime(duration)}
              </div>
            </div>

            <div className={cx('controls-right')}>
              {/* Action #7: Fullscreen toggle */}
              <button className={cx('control-button')} onClick={handleFullscreen}>
                {isFullscreen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 3V5H5V8H3V3H8ZM21 3V8H19V5H16V3H21ZM21 16V21H16V19H19V16H21ZM8 21H3V16H5V19H8V21Z" fill="white"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="white"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VideoPlayerModal;