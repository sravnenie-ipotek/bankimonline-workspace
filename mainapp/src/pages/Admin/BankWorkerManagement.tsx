/**
 * Bank Worker Management Admin Component
 * 
 * Provides admin interface for:
 * - Sending invitations to bank workers
 * - Managing invitation status
 * - Approving/rejecting worker registrations
 * - Viewing worker status and details
 * 
 * @author AI Assistant
 * @date 2025-01-09
 * @ticket PHASE3-ADMIN-INTERFACE
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import classNames from 'classnames/bind'
import { toast } from 'react-toastify'

import { Container } from '@components/ui/Container'
import { TitleElement } from '@components/ui/TitleElement'
import { Button } from '@components/ui/ButtonUI'
import { FormattedInput } from '@components/ui/FormattedInput'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { Modal } from '@components/ui/Modal'
import { Loader } from '@components/layout/Loader'

import { 
  bankWorkerApi, 
  InvitationListItem, 
  ApprovalQueueItem,
  InvitationRequest 
} from '@src/services/bankWorkerApi'

import styles from './BankWorkerManagement.module.scss'

const cx = classNames.bind(styles)

// TypeScript interfaces
interface Bank {
  id: string
  name: string
  branches: Array<{
    id: string
    name_en: string
    name_he: string
    name_ru: string
    branch_code: string
    city: string
  }>
}

interface InvitationFormData {
  email: string
  bankId: string
  branchId: string
  message: string
  expirationDays: number
}

/**
 * Invitation Form Component
 * Form for sending new invitations to bank workers
 */
const InvitationForm: React.FC<{
  banks: Bank[]
  onSubmit: (data: InvitationFormData) => Promise<void>
  loading: boolean
}> = ({ banks, onSubmit, loading }) => {
  const { t, i18n } = useTranslation()

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('validation.email.format'))
      .required(t('validation.email.required')),
    bankId: Yup.string()
      .required(t('validation.bankId.required')),
    branchId: Yup.string()
      .required(t('validation.branchId.required')),
    message: Yup.string()
      .max(500, t('validation.message.max')),
    expirationDays: Yup.number()
      .min(1, t('validation.expirationDays.min'))
      .max(30, t('validation.expirationDays.max'))
      .required(t('validation.expirationDays.required'))
  })

  return (
    <div className={cx('invitationForm')}>
      <TitleElement title={t('admin.invitation.title')} />
      
      <Formik
        initialValues={{
          email: '',
          bankId: '',
          branchId: '',
          message: '',
          expirationDays: 7
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => {
          const selectedBank = banks.find(bank => bank.id === values.bankId)
          
          return (
            <Form className={cx('form')}>
              {/* Email Input */}
              <div className={cx('formField')}>
                <FormattedInput
                  name="email"
                  title={t('admin.invitation.fields.email.label')}
                  placeholder={t('admin.invitation.fields.email.placeholder')}
                  value={values.email}
                  handleChange={(value) => setFieldValue('email', value)}
                  error={touched.email && errors.email}
                />
              </div>

              {/* Bank Selection */}
              <div className={cx('formField')}>
                <DropdownMenu
                  name="bankId"
                  title={t('admin.invitation.fields.bank.label')}
                  placeholder={t('admin.invitation.fields.bank.placeholder')}
                  options={banks.map(bank => ({
                    value: bank.id,
                    label: bank.name
                  }))}
                  value={values.bankId}
                  onChange={(value) => {
                    setFieldValue('bankId', value)
                    setFieldValue('branchId', '') // Reset branch when bank changes
                  }}
                  error={touched.bankId && errors.bankId}
                />
              </div>

              {/* Branch Selection */}
              {selectedBank && (
                <div className={cx('formField')}>
                  <DropdownMenu
                    name="branchId"
                    title={t('admin.invitation.fields.branch.label')}
                    placeholder={t('admin.invitation.fields.branch.placeholder')}
                    options={selectedBank.branches.map(branch => ({
                      value: branch.id,
                      label: i18n.language === 'he' ? branch.name_he :
                             i18n.language === 'ru' ? branch.name_ru :
                             branch.name_en,
                      subtitle: `${branch.branch_code} - ${branch.city}`
                    }))}
                    value={values.branchId}
                    onChange={(value) => setFieldValue('branchId', value)}
                    error={touched.branchId && errors.branchId}
                  />
                </div>
              )}

              {/* Expiration Days */}
              <div className={cx('formField')}>
                <FormattedInput
                  name="expirationDays"
                  title={t('admin.invitation.fields.expirationDays.label')}
                  placeholder={t('admin.invitation.fields.expirationDays.placeholder')}
                  value={values.expirationDays}
                  handleChange={(value) => setFieldValue('expirationDays', value)}
                  error={touched.expirationDays && errors.expirationDays}
                />
              </div>

              {/* Message */}
              <div className={cx('formField')}>
                <label className={cx('fieldLabel')}>
                  {t('admin.invitation.fields.message.label')}
                </label>
                <textarea
                  name="message"
                  placeholder={t('admin.invitation.fields.message.placeholder')}
                  value={values.message}
                  onChange={(e) => setFieldValue('message', e.target.value)}
                  className={cx('messageTextarea')}
                  rows={4}
                />
                {touched.message && errors.message && (
                  <Error message={errors.message} />
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="full"
                disabled={loading || isSubmitting}
                className={cx('submitButton')}
              >
                {loading ? t('common.sending') : t('admin.invitation.send')}
              </Button>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

/**
 * Invitations List Component
 * Displays list of sent invitations with status
 */
const InvitationsList: React.FC<{
  invitations: InvitationListItem[]
  loading: boolean
  onRefresh: () => void
}> = ({ invitations, loading, onRefresh }) => {
  const { t, i18n } = useTranslation()

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'warning', text: t('admin.status.pending') },
      used: { color: 'success', text: t('admin.status.used') },
      expired: { color: 'error', text: t('admin.status.expired') }
    }[status.toLowerCase()] || { color: 'neutral', text: status }

    return (
      <span className={cx('statusBadge', `statusBadge--${config.color}`)}>
        {config.text}
      </span>
    )
  }

  return (
    <div className={cx('invitationsList')}>
      <div className={cx('listHeader')}>
        <TitleElement title={t('admin.invitations.title')} />
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={loading}
          className={cx('refreshButton')}
        >
          {loading ? t('common.refreshing') : t('common.refresh')}
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : invitations.length === 0 ? (
        <div className={cx('emptyState')}>
          <p>{t('admin.invitations.empty')}</p>
        </div>
      ) : (
        <div className={cx('invitationsTable')}>
          <div className={cx('tableHeader')}>
            <span>{t('admin.invitations.columns.email')}</span>
            <span>{t('admin.invitations.columns.bank')}</span>
            <span>{t('admin.invitations.columns.status')}</span>
            <span>{t('admin.invitations.columns.created')}</span>
            <span>{t('admin.invitations.columns.expires')}</span>
          </div>
          
          {invitations.map((invitation) => (
            <div key={invitation.id} className={cx('tableRow')}>
              <span className={cx('email')}>{invitation.email}</span>
              <span className={cx('bank')}>
                {invitation.bankName}
                {invitation.branchName && (
                  <span className={cx('branch')}> - {invitation.branchName}</span>
                )}
              </span>
              <span className={cx('status')}>
                {getStatusBadge(invitation.status)}
              </span>
              <span className={cx('date')}>
                {new Date(invitation.createdAt).toLocaleDateString(i18n.language)}
              </span>
              <span className={cx('date')}>
                {new Date(invitation.expiresAt).toLocaleDateString(i18n.language)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Approval Queue Component
 * Displays workers pending approval with action buttons
 */
const ApprovalQueue: React.FC<{
  queue: ApprovalQueueItem[]
  loading: boolean
  onApprove: (id: string, comments?: string) => Promise<void>
  onReject: (id: string, reason: string, comments?: string) => Promise<void>
  onRefresh: () => void
}> = ({ queue, loading, onApprove, onReject, onRefresh }) => {
  const { t, i18n } = useTranslation()
  const [selectedWorker, setSelectedWorker] = useState<ApprovalQueueItem | null>(null)
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleApprove = async (worker: ApprovalQueueItem) => {
    setSelectedWorker(worker)
    setModalType('approve')
    setComments('')
  }

  const handleReject = async (worker: ApprovalQueueItem) => {
    setSelectedWorker(worker)
    setModalType('reject')
    setComments('')
    setRejectionReason('')
  }

  const submitApproval = async () => {
    if (!selectedWorker) return
    
    try {
      setSubmitting(true)
      await onApprove(selectedWorker.id, comments)
      setModalType(null)
      setSelectedWorker(null)
      toast.success(t('admin.approval.success'))
    } catch (error: any) {
      toast.error(error.message || t('admin.approval.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const submitRejection = async () => {
    if (!selectedWorker || !rejectionReason.trim()) return
    
    try {
      setSubmitting(true)
      await onReject(selectedWorker.id, rejectionReason, comments)
      setModalType(null)
      setSelectedWorker(null)
      toast.success(t('admin.rejection.success'))
    } catch (error: any) {
      toast.error(error.message || t('admin.rejection.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cx('approvalQueue')}>
      <div className={cx('listHeader')}>
        <TitleElement title={t('admin.approvalQueue.title')} />
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={loading}
          className={cx('refreshButton')}
        >
          {loading ? t('common.refreshing') : t('common.refresh')}
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : queue.length === 0 ? (
        <div className={cx('emptyState')}>
          <p>{t('admin.approvalQueue.empty')}</p>
        </div>
      ) : (
        <div className={cx('queueTable')}>
          {queue.map((worker) => (
            <div key={worker.id} className={cx('workerCard')}>
              <div className={cx('workerInfo')}>
                <h3 className={cx('workerName')}>{worker.fullName}</h3>
                <p className={cx('workerDetails')}>
                  {worker.position} • {worker.bankName} • {worker.branchName}
                </p>
                <p className={cx('workerEmail')}>{worker.email}</p>
                <p className={cx('registrationDate')}>
                  {t('admin.approvalQueue.registeredOn')}: {' '}
                  {new Date(worker.registrationDate).toLocaleDateString(i18n.language)}
                </p>
              </div>
              
              <div className={cx('workerActions')}>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(worker)}
                  className={cx('approveButton')}
                >
                  {t('admin.actions.approve')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleReject(worker)}
                  className={cx('rejectButton')}
                >
                  {t('admin.actions.reject')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isVisible={modalType === 'approve'}
        title={t('admin.approval.title')}
        onCancel={() => setModalType(null)}
        className={cx('approvalModal')}
      >
        <div className={cx('modalContent')}>
          <p className={cx('modalMessage')}>
            {t('admin.approval.message', { name: selectedWorker?.fullName })}
          </p>
          
          <div className={cx('modalField')}>
            <label className={cx('fieldLabel')}>
              {t('admin.approval.comments')} ({t('common.optional')})
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t('admin.approval.commentsPlaceholder')}
              className={cx('modalTextarea')}
              rows={3}
            />
          </div>
          
          <div className={cx('modalActions')}>
            <Button
              variant="secondary"
              onClick={() => setModalType(null)}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={submitApproval}
              disabled={submitting}
            >
              {submitting ? t('common.submitting') : t('admin.actions.approve')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isVisible={modalType === 'reject'}
        title={t('admin.rejection.title')}
        onCancel={() => setModalType(null)}
        className={cx('rejectionModal')}
      >
        <div className={cx('modalContent')}>
          <p className={cx('modalMessage')}>
            {t('admin.rejection.message', { name: selectedWorker?.fullName })}
          </p>
          
          <div className={cx('modalField')}>
            <label className={cx('fieldLabel')}>
              {t('admin.rejection.reason')} *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('admin.rejection.reasonPlaceholder')}
              className={cx('modalTextarea')}
              rows={2}
              required
            />
          </div>
          
          <div className={cx('modalField')}>
            <label className={cx('fieldLabel')}>
              {t('admin.rejection.comments')} ({t('common.optional')})
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t('admin.rejection.commentsPlaceholder')}
              className={cx('modalTextarea')}
              rows={3}
            />
          </div>
          
          <div className={cx('modalActions')}>
            <Button
              variant="secondary"
              onClick={() => setModalType(null)}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={submitRejection}
              disabled={submitting || !rejectionReason.trim()}
            >
              {submitting ? t('common.submitting') : t('admin.actions.reject')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/**
 * Main Bank Worker Management Component
 * Orchestrates invitation sending, listing, and approval workflows
 */
export const BankWorkerManagement: React.FC = () => {
  const { t } = useTranslation()

  // Component state
  const [activeTab, setActiveTab] = useState<'invitations' | 'queue'>('invitations')
  const [banks, setBanks] = useState<Bank[]>([])
  const [invitations, setInvitations] = useState<InvitationListItem[]>([])
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [invitationLoading, setInvitationLoading] = useState(false)
  const [queueLoading, setQueueLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadBanks(),
        loadInvitations(),
        loadApprovalQueue()
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBanks = async () => {
    try {
      const response = await bankWorkerApi.getBanks()
      if (response.status === 'success' && response.data) {
        setBanks(response.data)
      }
    } catch (error: any) {
      console.error('Error loading banks:', error)
      toast.error(error.message || t('errors.failedToLoadBanks'))
    }
  }

  const loadInvitations = async () => {
    try {
      setInvitationLoading(true)
      const response = await bankWorkerApi.getInvitations({ limit: 50 })
      if (response.status === 'success' && response.data) {
        setInvitations(response.data.invitations)
      }
    } catch (error: any) {
      console.error('Error loading invitations:', error)
      toast.error(error.message || t('errors.failedToLoadInvitations'))
    } finally {
      setInvitationLoading(false)
    }
  }

  const loadApprovalQueue = async () => {
    try {
      setQueueLoading(true)
      const response = await bankWorkerApi.getApprovalQueue({ limit: 50 })
      if (response.status === 'success' && response.data) {
        setApprovalQueue(response.data.queue)
      }
    } catch (error: any) {
      console.error('Error loading approval queue:', error)
      toast.error(error.message || t('errors.failedToLoadQueue'))
    } finally {
      setQueueLoading(false)
    }
  }

  const handleSendInvitation = async (data: InvitationFormData) => {
    try {
      const response = await bankWorkerApi.sendInvitation(data)
      if (response.status === 'success') {
        toast.success(t('admin.invitation.success'))
        await loadInvitations() // Refresh invitations list
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      throw error
    }
  }

  const handleApproveWorker = async (workerId: string, comments?: string) => {
    await bankWorkerApi.approveWorker(workerId, comments)
    await loadApprovalQueue() // Refresh queue
  }

  const handleRejectWorker = async (workerId: string, reason: string, comments?: string) => {
    await bankWorkerApi.rejectWorker(workerId, reason, comments)
    await loadApprovalQueue() // Refresh queue
  }

  if (loading) {
    return <Loader />
  }

  return (
    <Container>
      <div className={cx('managementContainer')}>
        {/* Header */}
        <div className={cx('header')}>
          <TitleElement 
            title={t('admin.bankWorker.title')} 
            tooltip={t('admin.bankWorker.tooltip')}
          />
        </div>

        {/* Tab Navigation */}
        <div className={cx('tabs')}>
          <button
            className={cx('tab', { 'tab--active': activeTab === 'invitations' })}
            onClick={() => setActiveTab('invitations')}
          >
            {t('admin.tabs.invitations')}
            {invitations.length > 0 && (
              <span className={cx('tabBadge')}>{invitations.length}</span>
            )}
          </button>
          <button
            className={cx('tab', { 'tab--active': activeTab === 'queue' })}
            onClick={() => setActiveTab('queue')}
          >
            {t('admin.tabs.approvalQueue')}
            {approvalQueue.length > 0 && (
              <span className={cx('tabBadge')}>{approvalQueue.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className={cx('tabContent')}>
          {activeTab === 'invitations' ? (
            <div className={cx('invitationsTab')}>
              <InvitationForm
                banks={banks}
                onSubmit={handleSendInvitation}
                loading={invitationLoading}
              />
              <InvitationsList
                invitations={invitations}
                loading={invitationLoading}
                onRefresh={loadInvitations}
              />
            </div>
          ) : (
            <div className={cx('queueTab')}>
              <ApprovalQueue
                queue={approvalQueue}
                loading={queueLoading}
                onApprove={handleApproveWorker}
                onReject={handleRejectWorker}
                onRefresh={loadApprovalQueue}
              />
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export default BankWorkerManagement 