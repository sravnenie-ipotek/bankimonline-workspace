import React, { createContext, useContext, ReactNode } from 'react'

interface ScreenLocationContextType {
  screenLocation: string
}

const ScreenLocationContext = createContext<ScreenLocationContextType | undefined>(undefined)

export const useScreenLocation = () => {
  const context = useContext(ScreenLocationContext)
  if (!context) {
    throw new Error('useScreenLocation must be used within a ScreenLocationProvider')
  }
  return context.screenLocation
}

interface ScreenLocationProviderProps {
  screenLocation: string
  children: ReactNode
}

export const ScreenLocationProvider: React.FC<ScreenLocationProviderProps> = ({ screenLocation, children }) => {
  return (
    <ScreenLocationContext.Provider value={{ screenLocation }}>
      {children}
    </ScreenLocationContext.Provider>
  )
}