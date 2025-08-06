/**
 * Bank Worker API Service
 * 
 * Integrates with Phase 2 backend endpoints for bank worker registration system
 * Provides type-safe API calls with comprehensive error handling
 * 
 * @author AI Assistant
 * @date 2025-01-09
 * @ticket PHASE3-BANK-WORKER-API
 */

import axios, { AxiosResponse } from 'axios'

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8004'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add admin token if available (for admin operations)
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken && config.url?.includes('/admin/')) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
    
    // Log API requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log API responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear admin token and redirect to login
      localStorage.removeItem('adminToken')
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = '/admin'
      }
    }
    
    return Promise.reject(error)
  }
)

// TypeScript interfaces for API responses
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  type: string
}

export interface InvitationData {
  id: string
  email: string
  bankId: string
  bankName: string
  branchId?: string
  branchName?: string
  expiresAt: string
  status: string
}

export interface BankBranch {
  id: string
  name_en: string
  name_he: string
  name_ru: string
  branch_code: string
  city: string
}

export interface RegistrationFormResponse {
  invitation: InvitationData
  branches: BankBranch[]
}

export interface RegistrationData {
  invitationToken: string
  fullName: string
  position: string
  branchId: string
  bankNumber: string
  termsAccepted: boolean
  language: string
}

export interface RegistrationResult {
  id: string
  status: string
  message: string
  approvalRequired: boolean
}

export interface WorkerStatus {
  id: string
  fullName: string
  position: string
  bankName: string
  branchName: string
  status: string
  registrationDate: string
  approvalDate?: string
  rejectionDate?: string
  rejectionReason?: string
  adminComments?: string
}

export interface InvitationRequest {
  email: string
  bankId: string
  branchId?: string
  message?: string
  expirationDays?: number
}

export interface InvitationListItem {
  id: string
  email: string
  bankName: string
  branchName?: string
  status: string
  createdAt: string
  expiresAt: string
  usedAt?: string
}

export interface ApprovalQueueItem {
  id: string
  fullName: string
  position: string
  email: string
  bankName: string
  branchName: string
  registrationDate: string
  status: string
}

/**
 * Bank Worker API Service Class
 * Provides all API operations for bank worker registration system
 */
class BankWorkerApiService {
  /**
   * Get registration form data using invitation token
   * Validates token and returns invitation details with bank branches
   */
  async getRegistrationForm(token: string): Promise<ApiResponse<RegistrationFormResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<RegistrationFormResponse>> = await apiClient.get(
        `/api/bank-worker/register/${token}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load registration form')
    }
  }

  /**
   * Complete bank worker registration
   * Submits registration form with validation
   */
  async completeRegistration(data: RegistrationData): Promise<ApiResponse<RegistrationResult>> {
    try {
      const response: AxiosResponse<ApiResponse<RegistrationResult>> = await apiClient.post(
        '/api/bank-worker/register',
        data
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  /**
   * Get registration status by worker ID
   * Returns current status and approval information
   */
  async getWorkerStatus(workerId: string): Promise<ApiResponse<WorkerStatus>> {
    try {
      const response: AxiosResponse<ApiResponse<WorkerStatus>> = await apiClient.get(
        `/api/bank-worker/status/${workerId}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get worker status')
    }
  }

  // Admin API methods

  /**
   * Send invitation to bank worker (Admin only)
   * Creates and sends invitation email with registration token
   */
  async sendInvitation(data: InvitationRequest): Promise<ApiResponse<{ invitationId: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ invitationId: string }>> = await apiClient.post(
        '/api/bank-worker/invite',
        data
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send invitation')
    }
  }

  /**
   * Get list of invitations (Admin only)
   * Returns paginated list with filtering options
   */
  async getInvitations(params?: {
    page?: number
    limit?: number
    status?: string
    bankId?: string
  }): Promise<ApiResponse<{ invitations: InvitationListItem[], total: number, page: number, limit: number }>> {
    try {
      const response = await apiClient.get('/api/admin/invitations', { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get invitations')
    }
  }

  /**
   * Get approval queue (Admin only)
   * Returns workers pending approval
   */
  async getApprovalQueue(params?: {
    page?: number
    limit?: number
    bankId?: string
  }): Promise<ApiResponse<{ queue: ApprovalQueueItem[], total: number, page: number, limit: number }>> {
    try {
      const response = await apiClient.get('/api/admin/approval-queue', { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get approval queue')
    }
  }

  /**
   * Approve worker registration (Admin only)
   * Approves pending worker with optional comments
   */
  async approveWorker(workerId: string, comments?: string): Promise<ApiResponse<{ approved: boolean }>> {
    try {
      const response = await apiClient.post(`/api/admin/approve/${workerId}`, { comments })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve worker')
    }
  }

  /**
   * Reject worker registration (Admin only)
   * Rejects pending worker with required reason
   */
  async rejectWorker(workerId: string, reason: string, comments?: string): Promise<ApiResponse<{ rejected: boolean }>> {
    try {
      const response = await apiClient.post(`/api/admin/reject/${workerId}`, { reason, comments })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject worker')
    }
  }

  /**
   * Get available banks for invitation (Admin only)
   * Returns list of banks that can invite workers
   */
  async getBanks(): Promise<ApiResponse<Array<{ id: string, name: string, branches: BankBranch[] }>>> {
    try {
      const response = await apiClient.get('/api/admin/banks')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get banks')
    }
  }
}

// Create and export singleton instance
export const bankWorkerApi = new BankWorkerApiService()

// Export individual methods for convenience
export const {
  getRegistrationForm,
  completeRegistration,
  getWorkerStatus,
  sendInvitation,
  getInvitations,
  getApprovalQueue,
  approveWorker,
  rejectWorker,
  getBanks
} = bankWorkerApi

export default bankWorkerApi 