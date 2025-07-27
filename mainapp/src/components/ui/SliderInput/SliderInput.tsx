import classNames from 'classnames/bind'
import { memo, useLayoutEffect, useState } from 'react'

import FormattedInput from '../FormattedInput/FormattedInput.tsx'
import Ranger from './Ranger/Ranger.tsx'
import styles from './SliderInput.module.scss'

const cx = classNames.bind(styles)

interface SliderInputProps {
  value: number
  max: number
  min: number
  name: string
  title: string
  handleChange: (value: number | string | null) => void
  error?: string | boolean
  disableRangeValues?: boolean
  tooltip?: string
  disableCurrency?: boolean
  unitsMax?: string
  unitsMin?: string
  disableRanger?: boolean
  'data-testid'?: string
}

const SliderInput = ({
  value,
  max,
  min,
  name,
  error,
  title,
  handleChange,
  disableRangeValues,
  tooltip,
  disableCurrency,
  unitsMax,
  unitsMin,
  'data-testid': dataTestId,
}: SliderInputProps) => {
  const [localValue, setLocalValue] = useState<number>(value)

  const handleSliderChange = (value: ReadonlyArray<number>) => {
    setLocalValue(value[0])
  }

  const handleSliderChangeComplete = (value: ReadonlyArray<number>) => {
    handleChange(value[0])
  }

  const handleInputChange = (value: number | string | null) => {
    handleChange(value)
  }

  useLayoutEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <>
      <div className={cx('slider-input')}>
        <FormattedInput
          disableCurrency={disableCurrency}
          title={title}
          tooltip={tooltip}
          name={name}
          error={error}
          value={localValue}
          handleChange={handleInputChange}
          data-testid={dataTestId}
        />

        <Ranger
          min={0}
          max={max}
          step={1}
          values={[value]}
          onUpdate={handleSliderChange}
          onChange={handleSliderChangeComplete}
          data-testid={dataTestId ? `${dataTestId}-slider` : undefined}
        />

        {!disableRangeValues && (
          <div className={cx('range-ranges')}>
            <div>
              <span className={name + 'Min'}>
                {min.toLocaleString('en-US')} {unitsMin && unitsMin}
              </span>
            </div>
            <div>
              <span className={name + 'Max'}>
                {max.toLocaleString('en-US')} {unitsMax && unitsMax}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default memo(SliderInput)
