// src/components/MapLoader.tsx
import React from 'react'
import { LoadScript } from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

interface Props {
  /** put maps / autocomplete inside this */
  children: React.ReactNode
  /** optional grey box shown when offline */
  placeholderHeight?: string | number
}

export default function MapLoader({
  children,
  placeholderHeight = 200,
}: Props) {
  /* ⬇️ 1.  Bail out early if the user is offline -- */
  if (!navigator.onLine) {
    return (
      <div
        style={{
          width: '100%',
          height: placeholderHeight,
          background: '#ececec',
          border: '1px solid #ddd',
        }}
      />
    )
  }

  /* ⬇️ 2.  Otherwise inject the Maps JS and then render the real thing */
  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      version="beta"
    >
      {children}
    </LoadScript>
  )
}
