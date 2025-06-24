import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames/bind'

import styles from './interactiveMap.module.scss'

const cx = classNames.bind(styles)

interface BranchLocation {
  value: string
  label: string
  city: string
  lat: number
  lng: number
}

interface InteractiveMapProps {
  branches: BranchLocation[]
  selectedBranch?: string
  selectedLocation?: { lat: number; lng: number } | null
  onBranchSelect: (branchValue: string) => void
  city?: string
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  branches,
  selectedBranch,
  selectedLocation,
  onBranchSelect,
  city
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsGoogleMapsLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || map) return

    // Default center (Israel)
    const defaultCenter = { lat: 31.7683, lng: 35.2137 }
    
    const newMap = new google.maps.Map(mapRef.current, {
      zoom: 8,
      center: defaultCenter,
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry.fill",
          "stylers": [{"color": "#242529"}]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#ffffff"}]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [{"color": "#161616"}]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [{"color": "#161616"}]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [{"color": "#404040"}]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
      }
    })

    setMap(newMap)
  }, [isGoogleMapsLoaded, map])

  // Update markers when branches change
  useEffect(() => {
    if (!map || !isGoogleMapsLoaded) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])

    // Add new markers
    const newMarkers: google.maps.Marker[] = []

    branches.forEach(branch => {
      const marker = new google.maps.Marker({
        position: { lat: branch.lat, lng: branch.lng },
        map: map,
        title: branch.label,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${selectedBranch === branch.value ? '#FBE54D' : '#FF6B6B'}" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      })

      marker.addListener('click', () => {
        onBranchSelect(branch.value)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Adjust map view to show all branches
    if (branches.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      branches.forEach(branch => {
        bounds.extend({ lat: branch.lat, lng: branch.lng })
      })
      map.fitBounds(bounds)
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 12) {
          map.setZoom(12)
        }
        google.maps.event.removeListener(listener)
      })
    }
  }, [map, branches, selectedBranch, onBranchSelect, isGoogleMapsLoaded])

  // Center map on selected location
  useEffect(() => {
    if (map && selectedLocation) {
      map.setCenter(selectedLocation)
      map.setZoom(14)
    }
  }, [map, selectedLocation])

  // Fallback map when Google Maps is not available
  const renderFallbackMap = () => (
    <div className={cx('fallback-map')}>
      <div className={cx('fallback-content')}>
        <div className={cx('map-placeholder')}>
          <div className={cx('map-icon')}>🗺️</div>
          <h3>Interactive Map</h3>
          <p>Map will display bank branch locations</p>
          {branches.length > 0 && (
            <div className={cx('branch-list')}>
              <h4>Available Branches:</h4>
              {branches.map(branch => (
                <button
                  key={branch.value}
                  onClick={() => onBranchSelect(branch.value)}
                  className={cx('branch-item', {
                    selected: selectedBranch === branch.value
                  })}
                >
                  📍 {branch.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={cx('interactive-map')}>
      {isGoogleMapsLoaded ? (
        <div ref={mapRef} className={cx('map-container')} />
      ) : (
        renderFallbackMap()
      )}
      
      {/* Map Legend */}
      <div className={cx('map-legend')}>
        <div className={cx('legend-item')}>
          <div className={cx('legend-marker', 'available')} />
          <span>Available Branch</span>
        </div>
        <div className={cx('legend-item')}>
          <div className={cx('legend-marker', 'selected')} />
          <span>Selected Branch</span>
        </div>
      </div>
    </div>
  )
}

export default InteractiveMap 