declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement | null, opts?: MapOptions)
      setCenter(latLng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      getZoom(): number | undefined
      fitBounds(bounds: LatLngBounds): void
    }

    class Marker {
      constructor(opts?: MarkerOptions)
      setMap(map: Map | null): void
      addListener(eventName: string, handler: () => void): MapsEventListener
    }

    class LatLngBounds {
      constructor()
      extend(point: LatLng | LatLngLiteral): void
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Point {
      constructor(x: number, y: number)
    }

    interface MapOptions {
      zoom?: number
      center?: LatLng | LatLngLiteral
      styles?: MapTypeStyle[]
      mapTypeControl?: boolean
      streetViewControl?: boolean
      fullscreenControl?: boolean
      zoomControl?: boolean
      zoomControlOptions?: ZoomControlOptions
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral
      map?: Map
      title?: string
      icon?: string | Icon | Symbol
    }

    interface Icon {
      url: string
      scaledSize?: Size
      anchor?: Point
    }

    interface ZoomControlOptions {
      position?: ControlPosition
    }

    interface MapTypeStyle {
      featureType?: string
      elementType?: string
      stylers?: Array<{ [key: string]: string }>
    }

    interface LatLng {
      lat(): number
      lng(): number
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    interface MapsEventListener {}

    enum ControlPosition {
      RIGHT_CENTER
    }

    namespace event {
      function addListener(
        instance: object,
        eventName: string,
        handler: () => void
      ): MapsEventListener
      function removeListener(listener: MapsEventListener): void
    }
  }
}

export {} 