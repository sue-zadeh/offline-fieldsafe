// src/components/OfflineIndicator.tsx
import React from 'react'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

interface OfflineIndicatorProps {
  isLoggedIn: boolean
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isLoggedIn }) => {
  const isOnline = useNetworkStatus()

  if (isOnline || !isLoggedIn) {
    return null
  }

  return (
    <div 
      className="alert alert-warning text-center mb-0" 
      style={{ 
        position: 'sticky', 
        top: '56px', // Below navbar
        zIndex: 1020,
        borderRadius: 0,
        fontSize: '0.9rem',
        padding: '8px 15px'
      }}
    >
      <strong>🔌 Offline Mode:</strong> You're working offline. New data will sync when connection is restored.
    </div>
  )
}

export default OfflineIndicator
