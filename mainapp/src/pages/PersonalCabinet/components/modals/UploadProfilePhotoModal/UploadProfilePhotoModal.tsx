import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@src/components/ui/Modal';
import styles from './uploadProfilePhotoModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface UploadProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
}

const UploadProfilePhotoModal: React.FC<UploadProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return t('file_type_error');
    }

    if (file.size > maxSize) {
      return t('file_size_error');
    }

    return '';
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleComputerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    // For mobile devices - open camera
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setIsDragging(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <Modal isVisible={isOpen} onCancel={handleClose} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>{t('upload_profile_photo_title')}</h2>
          <button className={cx('close-button')} onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={cx('upload-section')}>
          {!selectedFile ? (
            <>
              <div 
                className={cx('upload-area', { 'dragging': isDragging })}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={cx('upload-icon')}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={cx('upload-text')}>
                  <p>{t('drag_drop_file')}</p>
                  <button 
                    type="button" 
                    className={cx('computer-button')}
                    onClick={handleComputerUpload}
                  >
                    {t('use_computer')}
                  </button>
                </div>
              </div>

              {isMobile && (
                <button 
                  className={cx('camera-button')}
                  onClick={handleCameraCapture}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {t('take_photo_mobile')}
                </button>
              )}
            </>
          ) : (
            <div className={cx('preview-section')}>
              <div className={cx('preview-container')}>
                <img src={previewUrl} alt="Preview" className={cx('preview-image')} />
              </div>
              <div className={cx('file-info')}>
                <p className={cx('file-name')}>{selectedFile.name}</p>
                <p className={cx('file-size')}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                className={cx('change-file-button')}
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl('');
                  setError('');
                }}
              >
                {t('change_file')}
              </button>
            </div>
          )}

          {error && (
            <div className={cx('error-message')}>
              {error}
            </div>
          )}
        </div>

        <div className={cx('button-group')}>
          <button
            type="button"
            className={cx('upload-button')}
            disabled={!selectedFile}
            onClick={handleSave}
          >
            {t('upload')}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    </Modal>
  );
};

export default UploadProfilePhotoModal;
