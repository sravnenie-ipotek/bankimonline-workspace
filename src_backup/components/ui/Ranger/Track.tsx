// subcomponents/Track.tsx
import React from 'react'

interface TrackProps {
  source: { percent: number }
  target: { percent: number }
  getTrackProps: () => any
}

const Track: React.FC<TrackProps> = ({ source, target, getTrackProps }) => {
  return (
    <div
      style={{
        position: 'absolute',
        height: 8,
        zIndex: 1,
        backgroundColor: 'red',
        borderRadius: 4,
        cursor: 'pointer',
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps()}
    />
  )
}

export default Track
