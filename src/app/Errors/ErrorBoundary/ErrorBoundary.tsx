import { Component, ErrorInfo, ReactNode } from 'react'

import { NotFound } from '@src/app/Errors/NotFound'

// Страница обработки краха фронтенд приложения
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <NotFound type={'FALLBACK'} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
