import classNames from 'classnames/bind'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowsOutSimpleIcon } from '@assets/icons/ArrowsOutSimpleIcon'
import { SpeakerOffIcon } from '@assets/icons/SpeakerOffIcon'
import SpeakerOnIcon from '@assets/icons/SpeakerOnIcon/SpeakerOnIcon'
import { useWindowResize } from '@src/hooks/useWindowResize'

import VideoPlayerModal from '../VideoPlayerModal/VideoPlayerModal'
import styles from './videoPoster.module.scss'

const cx = classNames.bind(styles)

// Компонент баннера видео

type TypeProps = {
  title?: string
  subtitle?: string
  text?: string
  size?: 'normal' | 'small'
  onMusicToggle?: () => void  // Действие #4: Music toggle
  onFullscreen?: () => void   // Действие #5: Fullscreen mode
}
const VideoPoster: React.FC<TypeProps> = ({
  title,
  subtitle,
  text,
  size = 'normal',
  onMusicToggle,
  onFullscreen,
}) => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const soundControlsRef = useRef<HTMLDivElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const { isMobile } = useWindowResize()
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoClasses = {
    [size]: true,
  }

  const { i18n } = useTranslation()

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.setAttribute('src', '/static/promo.mp3')
      audioElementRef.current.setAttribute('loop', 'true')
    }
  }, [])

  // Handle mobile autoplay
  useEffect(() => {
    if (videoRef.current && isMobile) {
      const video = videoRef.current
      
      // Set up video for mobile autoplay
      video.muted = true
      video.playsInline = true
      video.loop = true
      
      // Try to autoplay on mobile
      const playPromise = video.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Video autoplay successful on mobile')
            setVideoLoaded(true)
          })
          .catch((error) => {
            console.warn('⚠️ Mobile autoplay failed, will retry on user interaction:', error)
            // Add click listener to start video on first user interaction
            const handleFirstInteraction = () => {
              video.play().catch(err => console.warn('Retry autoplay failed:', err))
              document.removeEventListener('touchstart', handleFirstInteraction)
              document.removeEventListener('click', handleFirstInteraction)
            }
            document.addEventListener('touchstart', handleFirstInteraction, { once: true })
            document.addEventListener('click', handleFirstInteraction, { once: true })
          })
      }
    }
  }, [isMobile])

  const handleMute = () => {
    // Call parent callback if provided (Действие #4)
    if (onMusicToggle) {
      onMusicToggle()
    }
    
    setIsMuted((prevIsMuted) => {
      if (audioElementRef.current && !isMobile) {
        if (prevIsMuted) {
          audioElementRef.current.volume = 0.5
          audioElementRef.current.play().catch(err => {
            console.warn('Audio play failed:', err)
          })
        } else {
          audioElementRef.current.pause()
          audioElementRef.current.currentTime = 0
        }
      }
      return !prevIsMuted
    })
  }
  
  const handleFullscreen = () => {
    // Call parent callback if provided (Действие #5)
    if (onFullscreen) {
      onFullscreen()
    }
    setIsPlayerOpen(true)
  }

  const handleVideoClick = () => {
    // If video isn't playing on mobile, try to start it
    if (videoRef.current && isMobile && videoRef.current.paused) {
      videoRef.current.play().catch(err => console.warn('Manual play failed:', err))
    }
  }

  return (
    <>
    <div className={cx('video', videoClasses)}>
      <video 
        ref={videoRef}
        loop 
        muted 
        playsInline
        preload="metadata"
        poster="/static/Background.png"
        autoPlay={true}
        onClick={handleVideoClick}
        style={{ cursor: isMobile ? 'pointer' : 'default' }}
      >
        <source src="/static/promo.mp4" type="video/mp4" />
        <source src="/static/promo.webm" type="video/webm" />
      </video>
      <div className={cx('video-wrapper')}>
        {/* Mobile autoplay indicator */}
        {isMobile && !videoLoaded && (
          <div className={cx('mobile-autoplay-hint')}>
            <span>Tap to start video</span>
          </div>
        )}
        <div className={cx('video-titles')}>
          <h2 className={cx('video-titles__title')}>{title}</h2>
          <p className={cx('video-titles__subtitle')}>{subtitle}</p>
          <span className={cx('video-titles__text')}>{text}</span>
        </div>
        <div className={cx('video-buttons')}>
            <div
              onClick={handleFullscreen}
              className="cursor-pointer"
              aria-label="Open video player"
              role="button"
            >
            <ArrowsOutSimpleIcon size={isMobile ? 24 : 32} />
            </div>
          <div
            onClick={handleMute}
            ref={soundControlsRef}
            className="cursor-pointer"
          >
            {isMuted ? (
              <SpeakerOffIcon size={isMobile ? 40 : 73} />
            ) : (
              <SpeakerOnIcon size={isMobile ? 40 : 73} />
            )}
          </div>
        </div>
      </div>
      {!isMobile && (
        <audio loop ref={audioElementRef}>
          <source src="/static/promo.ogg" type="audio/ogg" />
          <source src="/static/promo.mp3" type="audio/mpeg" />
        </audio>
      )}
    </div>
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        videoSrc="/static/promo.mp4"
      />
    </>
  )
}

export default VideoPoster
