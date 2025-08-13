import { useEffect, useState } from 'react'

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const updateStatus = () => {
      const newOnlineStatus = navigator.onLine
      console.log(`🌐 Network status changed: ${newOnlineStatus ? 'Online' : 'Offline'}`)
      setIsOnline(newOnlineStatus)
    }
    
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    updateStatus()
    
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return isOnline
}
