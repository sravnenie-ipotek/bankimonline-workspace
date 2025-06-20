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
}
const VideoPoster: React.FC<TypeProps> = ({
  title,
  subtitle,
  text,
  size = 'normal',
}) => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const soundControlsRef = useRef<HTMLDivElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const { isMobile } = useWindowResize()

  const videoClasses = {
    [size]: true,
  }

  const { i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.setAttribute('src', '/static/promo.mp3')
      audioElementRef.current.setAttribute('loop', 'true')
    }
  }, [])

  const handleMute = () => {
    setIsMuted((prevIsMuted) => {
      if (audioElementRef.current) {
        if (prevIsMuted) {
          audioElementRef.current.volume = 0.5
          audioElementRef.current.play()
        } else {
          audioElementRef.current.pause()
          audioElementRef.current.currentTime = 0
        }
      }
      return !prevIsMuted
    })
  }

  return (
    <>
    <div className={cx('video', videoClasses)}>
      <video loop muted autoPlay poster="/static/Background.png">
        <source src="/static/promo.mp4" type="video/mp4" />
        <source src="/static/promo.webm" type="video/webm" />
      </video>
      <div className={cx('video-wrapper')}>
        <div className={cx('video-titles')}>
          <h2 className={cx('video-titles__title')}>{title}</h2>
          <p className={cx('video-titles__subtitle')}>{subtitle}</p>
          <span className={cx('video-titles__text')}>{text}</span>
        </div>
        <div className={cx('video-buttons')}>
            <div
              onClick={() => setIsPlayerOpen(true)}
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
      <audio loop ref={audioElementRef}>
        <source src="/static/promo.ogg" type="audio/ogg" />
        <source src="/static/promo.mp3" type="audio/mpeg" />
      </audio>
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
