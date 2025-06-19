import React from 'react';
import { Modal } from '@src/components/ui/Modal';
import styles from './videoPlayerModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoSrc }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isVisible={isOpen} onCancel={onClose} className={cx('video-modal')}>
      <video className={cx('video-player')} src={videoSrc} controls autoPlay loop>
        Your browser does not support the video tag.
      </video>
    </Modal>
  );
};

export default VideoPlayerModal; 