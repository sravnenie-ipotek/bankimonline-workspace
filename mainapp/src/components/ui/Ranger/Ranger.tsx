import React from 'react'
import { Handles, Rail, Slider, Tracks } from 'react-compound-slider'

// ORPHAN CSS FIX: Import critical slider styling (yellow theme, touch handling, accessibility)
import './Ranger.css'

// Эти компоненты можно создать или настроить в соответствии с вашими требованиями
import Track from '@components/ui/Ranger/Track.tsx'

import Handle from './Handle.tsx'

const sliderStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
}

interface RangerProps {
  min: number
  max: number
  step: number
  values: number[]
  onChange: (values: readonly number[]) => void
}

const Ranger: React.FC<RangerProps> = ({
  min,
  max,
  step,
  values,
  onChange,
}) => {
  return (
    <Slider
      mode={2}
      step={step}
      domain={[min, max]}
      rootStyle={sliderStyle}
      onUpdate={onChange}
      values={values}
    >
      <Rail>
        {({ getRailProps }) => (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: 8,
              borderRadius: 4,
              cursor: 'pointer',
              backgroundColor: 'gray',
            }}
            {...getRailProps()}
          />
        )}
      </Rail>
      <Handles>
        {({ handles, getHandleProps }) => (
          <div className="slider-handles">
            {handles.map((handle) => (
              <Handle
                key={handle.id}
                handle={handle}
                domain={[min, max]}
                getHandleProps={getHandleProps}
              />
            ))}
          </div>
        )}
      </Handles>
      <Tracks left={false} right={false}>
        {({ tracks, getTrackProps }) => (
          <div className="slider-tracks">
            {tracks.map(({ id, source, target }) => (
              <Track
                key={id}
                source={source}
                target={target}
                getTrackProps={getTrackProps}
              />
            ))}
          </div>
        )}
      </Tracks>
    </Slider>
  )
}

export default Ranger
