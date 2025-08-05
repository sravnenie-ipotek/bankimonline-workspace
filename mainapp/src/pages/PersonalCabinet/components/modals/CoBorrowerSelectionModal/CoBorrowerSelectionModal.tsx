import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@src/components/ui/Modal'
import styles from './coBorrowerSelectionModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface CoBorrower {
  id: string
  name: string
  phone?: string
  isSelected?: boolean
}

interface CoBorrowerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (selectedCoBorrowers: string[]) => void
  onSkip: () => void
  coBorrowers?: CoBorrower[]
}

export const CoBorrowerSelectionModal: React.FC<CoBorrowerSelectionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onSkip,
  coBorrowers = []
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Default co-borrowers from Figma design
  const defaultCoBorrowers: CoBorrower[] = [
    {
      id: 'co1',
      name: 'Людмила Пушкина',
      phone: '+972 50 123 4567',
      isSelected: true // Selected by default as shown in Figma
    },
    {
      id: 'co2', 
      name: 'Николай Сергеев',
      phone: '+972 54 987 6543',
      isSelected: false
    }
  ]

  const availableCoBorrowers = coBorrowers.length > 0 ? coBorrowers : defaultCoBorrowers
  const [selectedCoBorrowers, setSelectedCoBorrowers] = useState<string[]>(
    availableCoBorrowers.filter(cb => cb.isSelected).map(cb => cb.id)
  )

  // Action #1 - Close modal
  const handleClose = () => {
    onClose()
  }

  // Action #2 - Toggle co-borrower selection
  const handleCoBorrowerToggle = (coBorrowerId: string) => {
    setSelectedCoBorrowers(prev => {
      if (prev.includes(coBorrowerId)) {
        return prev.filter(id => id !== coBorrowerId)
      } else {
        return [...prev, coBorrowerId]
      }
    })
  }

  // Action #3 - Continue with selected co-borrowers
  const handleContinue = () => {
    onContinue(selectedCoBorrowers)
    onClose()
    // Navigate to application accepted page or next step
    navigate('/personal-cabinet/application-accepted')
  }

  // Action #4 - Skip step
  const handleSkip = () => {
    onSkip()
    onClose()
    // Navigate to application accepted page or next step
    navigate('/personal-cabinet/application-accepted')
  }

  return (
    <Modal isVisible={isOpen} onCancel={handleClose} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Action #1: Close Button */}
        <button
          type="button"
          className={cx('close-button')}
          onClick={handleClose}
          aria-label={t('close', 'Закрыть')}
        >
          ×
        </button>

        {/* Action #5: Modal Title */}
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>
            {t('select_co_borrowers_for_program', 'Выберите созаемщиков для программы')}
          </h2>
        </div>

        {/* Action #2: Co-borrower Selection Cards */}
        <div className={cx('co-borrowers-list')}>
          {availableCoBorrowers.map((coBorrower) => (
            <div
              key={coBorrower.id}
              className={cx('co-borrower-card', {
                selected: selectedCoBorrowers.includes(coBorrower.id)
              })}
              onClick={() => handleCoBorrowerToggle(coBorrower.id)}
            >
              <div className={cx('co-borrower-info')}>
                <div className={cx('co-borrower-name')}>
                  {coBorrower.name}
                </div>
                {coBorrower.phone && (
                  <div className={cx('co-borrower-phone')}>
                    {coBorrower.phone}
                  </div>
                )}
              </div>
              
              <div className={cx('checkbox-container')}>
                <div className={cx('checkbox', {
                  checked: selectedCoBorrowers.includes(coBorrower.id)
                })}>
                  {selectedCoBorrowers.includes(coBorrower.id) && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13.5 4.5L6 12L2.5 8.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={cx('button-group')}>
          {/* Action #3: Continue Button */}
          <button
            type="button"
            className={cx('continue-button')}
            onClick={handleContinue}
            disabled={selectedCoBorrowers.length === 0}
          >
            {t('continue', 'Дальше')}
          </button>

          {/* Action #4: Skip Step Button */}
          <button
            type="button"
            className={cx('skip-button')}
            onClick={handleSkip}
          >
            {t('skip_step', 'Пропустить шаг')}
          </button>
        </div>
      </div>
    </Modal>
  )
} 