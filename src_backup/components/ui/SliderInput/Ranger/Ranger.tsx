import classNames from 'classnames/bind'
import React from 'react'
import { Handles, Rail, Slider, Tracks } from 'react-compound-slider'
import { useTranslation } from 'react-i18next'

import Track from '@components/ui/SliderInput/Ranger/Track.tsx'

import Handle from './Handle.tsx'
import styles from './Ranger.module.scss'

const cx = classNames.bind(styles)
interface RangerProps {
  min: number
  max: number
  step: number
  values: readonly number[]
  onUpdate: (values: ReadonlyArray<number>) => void
  onChange: (values: ReadonlyArray<number>) => void
}

const Ranger: React.FC<RangerProps> = ({
  min,
  max,
  step,
  values,
  onUpdate,
  onChange,
}) => {
  const { i18n } = useTranslation()

  return (
    <Slider
      mode={1}
      step={step}
      domain={[min, max]}
      onUpdate={onUpdate}
      onChange={onChange}
      values={values}
      reversed={i18n.language === 'he'}
      className={cx('slider')}
    >
      <Rail>
        {({ getRailProps }) => (
          <div
            className={cx('rail', 'bg-base-secondaryDefaultButton')}
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
      <Tracks left={i18n.language !== 'he'} right={i18n.language === 'he'}>
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
