import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@mui/material'
import { Error } from '@components/ui/Error'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error boundary specifically for API-related failures
 * Provides graceful fallback UI and recovery options
 */
class ApiErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error Boundary caught error:', error, errorInfo)
    }
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Update state with error info
    this.setState({
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }
      
      // Default error UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback component with retry functionality
 */
const DefaultErrorFallback: React.FC<{ error: Error | null, onReset: () => void }> = ({ error, onReset }) => {
  const { t } = useTranslation()
  
  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network')
  const isDatabaseError = error?.message?.includes('database') || error?.message?.includes('connection')
  
  const getErrorMessage = () => {
    if (isNetworkError) {
      return t('error_network_failure', 'Network connection error. Please check your internet connection and try again.')
    }
    if (isDatabaseError) {
      return t('error_database_connection', 'Database connection error. Please try again later.')
    }
    return t('error_api_generic', 'An error occurred while loading data. Please try again.')
  }
  
  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0',
      textAlign: 'center'
    }}>
      <h3 style={{ color: '#c92a2a', marginBottom: '10px' }}>
        {t('error_boundary_title', 'Something went wrong')}
      </h3>
      <Error error={getErrorMessage()} />
      {process.env.NODE_ENV === 'development' && error && (
        <details style={{ marginTop: '10px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: '#666' }}>
            {t('error_technical_details', 'Technical details')}
          </summary>
          <pre style={{ 
            fontSize: '12px', 
            backgroundColor: '#f8f9fa', 
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '10px'
          }}>
            {error.toString()}
          </pre>
        </details>
      )}
      <Button 
        onClick={onReset}
        variant="contained"
        color="primary"
        style={{ marginTop: '15px' }}
      >
        {t('error_retry_button', 'Try Again')}
      </Button>
    </div>
  )
}

/**
 * Wrapper component to use the error boundary with hooks
 */
export const ApiErrorBoundary: React.FC<Props> = (props) => {
  return <ApiErrorBoundaryClass {...props} />
}