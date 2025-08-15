/**
 * Bank Worker Status Component
 * 
 * Displays registration status and approval information for bank workers
 * Provides real-time status updates and next steps guidance
 * 
 * @author AI Assistant
 * @date 2025-01-09
 * @ticket PHASE3-BANK-WORKER-STATUS
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'

import { Loader } from '@components/layout/Loader'
import { Container } from '@components/ui/Container'
import { TitleElement } from '@components/ui/TitleElement'
import { Button } from '@components/ui/ButtonUI'
import { Error } from '@components/ui/Error'

import { bankWorkerApi, WorkerStatus } from '@src/services/bankWorkerApi'

import styles from './BankWorkerStatus.module.scss'

const cx = classNames.bind(styles)

/**
 * Status Badge Component
 * Displays colored status indicators
 */
const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const { t } = useTranslation()
  
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'warning', text: t('status.pending') }
      case 'approved':
        return { color: 'success', text: t('status.approved') }
      case 'rejected':
        return { color: 'error', text: t('status.rejected') }
      case 'active':
        return { color: 'success', text: t('status.active') }
      case 'inactive':
        return { color: 'neutral', text: t('status.inactive') }
      default:
        return { color: 'neutral', text: status }
    }
  }

  const config = getStatusConfig(status)
  
  return (
    <span className={cx('statusBadge', `statusBadge--${config.color}`, className)}>
      {config.text}
    </span>
  )
}

/**
 * Bank Worker Status Component
 * Main component for displaying registration status
 */
export const BankWorkerStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  // Component state
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<WorkerStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  /**
   * Load worker status data
   * Fetches current registration and approval status
   */
  const loadStatus = async (showRefreshing = false) => {
    if (!id) {
      setError(t('errors.invalidWorkerId'))
      setLoading(false)
      return
    }

    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Call the real API for all registrations
      const response = await bankWorkerApi.getWorkerStatus(id)
      
      if (response.status === 'success' && response.data) {
        setStatus(response.data)
        setError(null)
      } else {
        setError(response.message || t('errors.failedToLoadStatus'))
      }
    } catch (err: any) {
      console.error('Error loading worker status:', err)
      setError(err.message || t('errors.networkError'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load status on component mount
  useEffect(() => {
    loadStatus()
  }, [id, t])

  /**
   * Handle refresh button click
   * Reloads status data with loading indicator
   */
  const handleRefresh = () => {
    loadStatus(true)
  }

  /**
   * Get next steps based on current status
   * Provides guidance for workers on what to do next
   */
  const getNextSteps = (status: WorkerStatus) => {
    switch (status.status.toLowerCase()) {
      case 'pending':
        return {
          title: t('nextSteps.pending.title'),
          description: t('nextSteps.pending.description'),
          actions: [
            {
              text: t('nextSteps.pending.contactAdmin'),
              action: () => window.location.href = 'mailto:admin@bankimonline.com'
            }
          ]
        }
      case 'approved':
        return {
          title: t('nextSteps.approved.title'),
          description: t('nextSteps.approved.description'),
          actions: [
            {
              text: t('nextSteps.approved.accessSystem'),
              action: () => navigate('/personal-cabinet')
            }
          ]
        }
      case 'rejected':
        return {
          title: t('nextSteps.rejected.title'),
          description: t('nextSteps.rejected.description'),
          actions: [
            {
              text: t('nextSteps.rejected.contactSupport'),
              action: () => window.location.href = 'mailto:support@bankimonline.com'
            }
          ]
        }
      default:
        return null
    }
  }

  // Loading state
  if (loading) {
    return <Loader />
  }

  // Error state
  if (error && !status) {
    return (
      <Container>
        <div className={cx('errorContainer')}>
          <TitleElement title={t('status.error.title')} />
          <Error message={error} />
          <div className={cx('errorActions')}>
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className={cx('backButton')}
            >
              {t('common.backToHome')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className={cx('retryButton')}
            >
              {t('common.retry')}
            </Button>
                  </div>

      </div>
    </Container>
  )
  }

  if (!status) {
    return null
  }

  const nextSteps = getNextSteps(status)

  return (
    <Container>
      <div className={cx('statusContainer')}>
        {/* Header */}
        <div className={cx('header')}>
          <TitleElement 
            title={t('status.title')} 
            tooltip={t('status.tooltip')}
          />
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cx('refreshButton')}
          >
            {refreshing ? t('common.refreshing') : t('common.refresh')}
          </Button>
        </div>

        {/* Status Overview */}
        <div className={cx('statusOverview')}>
          <div className={cx('statusHeader')}>
            <h2 className={cx('workerName')}>{status.fullName}</h2>
            <StatusBadge status={status.status} className={cx('mainStatus')} />
          </div>
          
          <div className={cx('statusDetails')}>
            <div className={cx('detailRow')}>
              <span className={cx('label')}>{t('status.fields.position')}:</span>
              <span className={cx('value')}>{status.position}</span>
            </div>
            <div className={cx('detailRow')}>
              <span className={cx('label')}>{t('status.fields.bank')}:</span>
              <span className={cx('value')}>{status.bankName}</span>
            </div>
            <div className={cx('detailRow')}>
              <span className={cx('label')}>{t('status.fields.branch')}:</span>
              <span className={cx('value')}>{status.branchName}</span>
            </div>
            <div className={cx('detailRow')}>
              <span className={cx('label')}>{t('status.fields.registrationDate')}:</span>
              <span className={cx('value')}>
                {new Date(status.registrationDate).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className={cx('timeline')}>
          <h3 className={cx('timelineTitle')}>{t('status.timeline.title')}</h3>
          
          <div className={cx('timelineItems')}>
            {/* Registration */}
            <div className={cx('timelineItem', 'timelineItem--completed')}>
              <div className={cx('timelineIcon')} />
              <div className={cx('timelineContent')}>
                <h4 className={cx('timelineItemTitle')}>{t('status.timeline.registration')}</h4>
                <p className={cx('timelineItemDate')}>
                  {new Date(status.registrationDate).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Approval/Rejection */}
            <div className={cx('timelineItem', {
              'timelineItem--completed': status.approvalDate || status.rejectionDate,
              'timelineItem--pending': !status.approvalDate && !status.rejectionDate,
              'timelineItem--error': status.rejectionDate
            })}>
              <div className={cx('timelineIcon')} />
              <div className={cx('timelineContent')}>
                <h4 className={cx('timelineItemTitle')}>
                  {status.approvalDate ? t('status.timeline.approved') :
                   status.rejectionDate ? t('status.timeline.rejected') :
                   t('status.timeline.pendingApproval')}
                </h4>
                {(status.approvalDate || status.rejectionDate) && (
                  <p className={cx('timelineItemDate')}>
                    {new Date(status.approvalDate || status.rejectionDate!).toLocaleDateString(i18n.language, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                {status.rejectionReason && (
                  <p className={cx('rejectionReason')}>
                    <strong>{t('status.rejectionReason')}:</strong> {status.rejectionReason}
                  </p>
                )}
                {status.adminComments && (
                  <p className={cx('adminComments')}>
                    <strong>{t('status.adminComments')}:</strong> {status.adminComments}
                  </p>
                )}
              </div>
            </div>

            {/* System Access (if approved) */}
            {status.approvalDate && (
              <div className={cx('timelineItem', {
                'timelineItem--completed': status.status === 'active',
                'timelineItem--pending': status.status !== 'active'
              })}>
                <div className={cx('timelineIcon')} />
                <div className={cx('timelineContent')}>
                  <h4 className={cx('timelineItemTitle')}>{t('status.timeline.systemAccess')}</h4>
                  <p className={cx('timelineItemDescription')}>
                    {status.status === 'active' ? 
                      t('status.timeline.accessGranted') : 
                      t('status.timeline.accessPending')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        {nextSteps && (
          <div className={cx('nextSteps')}>
            <h3 className={cx('nextStepsTitle')}>{nextSteps.title}</h3>
            <p className={cx('nextStepsDescription')}>{nextSteps.description}</p>
            
            {nextSteps.actions && nextSteps.actions.length > 0 && (
              <div className={cx('nextStepsActions')}>
                {nextSteps.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="primary"
                    onClick={action.action}
                    className={cx('actionButton')}
                  >
                    {action.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className={cx('errorMessage')}>
            <Error message={error} />
          </div>
        )}

        {/* Footer Actions */}
        <div className={cx('footerActions')}>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className={cx('backButton')}
          >
            {t('common.backToHome')}
          </Button>
          
          {status.status === 'approved' && (
            <Button
              variant="primary"
              onClick={() => navigate('/personal-cabinet')}
              className={cx('accessButton')}
            >
              {t('status.accessSystem')}
            </Button>
          )}
        </div>
      </div>
    </Container>
  )
}

export default BankWorkerStatus 