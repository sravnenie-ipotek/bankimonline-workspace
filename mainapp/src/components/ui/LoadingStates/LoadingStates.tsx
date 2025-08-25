import React from 'react'
import { CircularProgress, Skeleton, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'text'
  size?: 'small' | 'medium' | 'large'
  message?: string
  fullScreen?: boolean
}

/**
 * Unified loading states component (Bug #11)
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  size = 'medium',
  message,
  fullScreen = false
}) => {
  const { t } = useTranslation()
  
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 20
      case 'large': return 60
      default: return 40
    }
  }
  
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      padding={2}
      minHeight={fullScreen ? '100vh' : '200px'}
    >
      {type === 'spinner' && (
        <CircularProgress size={getSizeValue()} />
      )}
      
      {type === 'skeleton' && (
        <Box width="100%">
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="text" height={40} />
        </Box>
      )}
      
      {type === 'dots' && (
        <Box className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </Box>
      )}
      
      {message && (
        <Box color="text.secondary" textAlign="center">
          {message}
        </Box>
      )}
    </Box>
  )
  
  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="background.paper"
        zIndex={9999}
      >
        {content}
      </Box>
    )
  }
  
  return content
}

/**
 * Form field loading state
 */
export const FieldLoadingState: React.FC = () => (
  <Skeleton variant="rectangular" height={56} width="100%" />
)

/**
 * Button loading state
 */
export const ButtonLoadingState: React.FC<{ width?: number | string }> = ({ width = 120 }) => (
  <Skeleton variant="rectangular" height={40} width={width} />
)