/**
 * Session management utilities (Bugs #18, #19)
 * Handles logout cleanup and session timeout warnings
 */

import { toast } from 'react-toastify'

/**
 * Clear all sensitive data from localStorage on logout (Bug #18)
 */
export const clearSessionData = (): void => {
  // List of keys to preserve after logout
  const preserveKeys = [
    'i18nextLng',           // Language preference
    'theme',                // UI theme
    'acceptedCookies',      // Cookie consent
  ]
  
  // Get all localStorage keys
  const allKeys = Object.keys(localStorage)
  
  // Remove all except preserved keys
  allKeys.forEach(key => {
    if (!preserveKeys.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  
  // Clear sessionStorage completely
  sessionStorage.clear()
  
  // Clear Redux persist storage
  const persistKeys = ['persist:root', 'persist:mortgage', 'persist:credit']
  persistKeys.forEach(key => localStorage.removeItem(key))
  
  // Clear any cached API tokens
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  
  // Clear IndexedDB if used
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name)
        }
      })
    }).catch(() => {
      // Silently fail if IndexedDB is not available
    })
  }
}

/**
 * Session timeout configuration
 */
interface SessionConfig {
  warningTime: number    // Time before showing warning (ms)
  timeoutTime: number    // Total session timeout (ms)
  onWarning?: () => void
  onTimeout?: () => void
}

/**
 * Session timeout manager (Bug #19)
 */
export class SessionTimeoutManager {
  private warningTimer: NodeJS.Timeout | null = null
  private timeoutTimer: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private config: SessionConfig
  private warningShown: boolean = false
  
  constructor(config: SessionConfig) {
    this.config = {
      warningTime: config.warningTime || 25 * 60 * 1000, // 25 minutes default
      timeoutTime: config.timeoutTime || 30 * 60 * 1000, // 30 minutes default
      onWarning: config.onWarning || this.defaultWarning,
      onTimeout: config.onTimeout || this.defaultTimeout
    }
    
    this.setupActivityListeners()
    this.resetTimers()
  }
  
  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true)
    })
  }
  
  private handleActivity = (): void => {
    this.lastActivity = Date.now()
    
    // Reset timers if warning was shown
    if (this.warningShown) {
      this.warningShown = false
      this.resetTimers()
      toast.dismiss('session-warning')
    }
  }
  
  private resetTimers(): void {
    // Clear existing timers
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
    }
    
    // Set new timers
    this.warningTimer = setTimeout(() => {
      this.showWarning()
    }, this.config.warningTime)
    
    this.timeoutTimer = setTimeout(() => {
      this.handleTimeout()
    }, this.config.timeoutTime)
  }
  
  private showWarning(): void {
    this.warningShown = true
    if (this.config.onWarning) {
      this.config.onWarning()
    }
  }
  
  private handleTimeout(): void {
    if (this.config.onTimeout) {
      this.config.onTimeout()
    }
    this.destroy()
  }
  
  private defaultWarning(): void {
    const remainingMinutes = Math.floor((this.config.timeoutTime - this.config.warningTime) / 60000)
    
    toast.warning(
      `Your session will expire in ${remainingMinutes} minutes. Please save your work.`,
      {
        toastId: 'session-warning',
        autoClose: false,
        closeButton: true,
        position: 'top-center'
      }
    )
  }
  
  private defaultTimeout(): void {
    clearSessionData()
    window.location.href = '/login?reason=timeout'
  }
  
  public extendSession(): void {
    this.lastActivity = Date.now()
    this.warningShown = false
    this.resetTimers()
  }
  
  public destroy(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
    }
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true)
    })
  }
}

/**
 * Hook for session management
 */
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export const useSessionTimeout = (isAuthenticated: boolean) => {
  const navigate = useNavigate()
  const managerRef = useRef<SessionTimeoutManager | null>(null)
  
  useEffect(() => {
    if (isAuthenticated) {
      managerRef.current = new SessionTimeoutManager({
        warningTime: 25 * 60 * 1000, // 25 minutes
        timeoutTime: 30 * 60 * 1000, // 30 minutes
        onWarning: () => {
          toast.warning(
            'Your session will expire soon. Click anywhere to continue.',
            {
              toastId: 'session-warning',
              autoClose: false,
              position: 'top-center'
            }
          )
        },
        onTimeout: () => {
          clearSessionData()
          navigate('/login?reason=timeout')
        }
      })
    } else {
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
    
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
      }
    }
  }, [isAuthenticated, navigate])
  
  return managerRef.current
}