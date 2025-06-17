import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import formatNumeric from '@src/utils/helpers/fmt'

import FormattedInput from '../ui/FormattedInput/FormattedInput'
import './Ranger/Ranger.css'
import Ranger from './Ranger/Ranger.tsx'

// Компонент для слайдера
export default function SlideInput(props) {
  const value = 0
  const [sliderValues, setSliderValues] = useState([0, 100])
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]
  let setValue
  if (i18n.language === 'he') {
    setValue = (event) => {
      const container = document.getElementsByClassName(props.name)[0]
      container.value = formatNumeric(
        (
          parseFloat(props.max.replaceAll(',', '')) -
          ((props.max.replaceAll(',', '') - props.min.replaceAll(',', '')) *
            event[0]) /
            100
        ).toFixed(0)
      )
      props.handleChange(container.value)
      setSliderValues(event)
    }
  } else {
    setValue = (event) => {
      const container = document.getElementsByClassName(props.name)[0]
      container.value = formatNumeric(
        (
          parseFloat(props.min.replaceAll(',', '')) +
          ((props.max.replaceAll(',', '') - props.min.replaceAll(',', '')) *
            event[0]) /
            100
        ).toFixed(0)
      )
      props.handleChange(container.value)
      setSliderValues(event)
    }
  }

  useEffect(() => {
    setValue([0, 100]) //parseI
    // nt((props.value/props.max)*100)]);
  }, [])

  if (i18n.language === 'he') {
    return (
      <>
        <div
          style={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            // gap: '0.75rem',
            textAlign: 'start',
            color: '#fff',
            display: 'flex',
          }}
        >
          {typeof props.disableCurrency === 'undefined' ? (
            <FormattedInput
              title={props.title}
              tooltip={props.tooltip}
              hasTooltip={props.hasTooltip}
              name={props.name}
              min={props.min}
              errorText={props.errorText}
              moreThan={props.moreThan}
              lessThan={props.lessThan}
              max={props.max}
              ttop={props.ttop}
              tleft={props.tleft}
              tright={props.tright}
              value={props.value.replaceAll(',', '')}
              handleChange={props.handleChange}
            />
          ) : (
            <FormattedInput
              disableCurrency={true}
              hasTooltip={props.hasTooltip}
              title={props.title}
              ttop={props.ttop}
              tleft={props.tleft}
              tright={props.tright}
              name={props.name}
              value={props?.value.replaceAll(',', '')}
              min={props.min}
              max={props.max}
              errorText={props.errorText}
              moreThan={props.moreThan}
              lessThan={props.lessThan}
              handleChange={props.handleChange}
            />
          )}

          <Ranger
            min={0}
            max={100}
            step={1}
            values={sliderValues}
            onChange={setValue}
          />

          {typeof props.disableRangeValues === 'undefined' ? (
            <div className={'range-ranges'}>
              <div style={{ position: 'relative', lineHeight: '140%' }}>
                <span className={props.name + 'Max'}>
                  {props.max}{' '}
                  {typeof props.unitsMax !== 'undefined' ? props.unitsMax : ''}{' '}
                </span>
              </div>
              <div
                style={{
                  position: 'relative',
                  lineHeight: '140%',
                  textAlign: 'left',
                }}
              >
                <span className={props.name + 'Min'}>
                  {props.min}{' '}
                  {typeof props.unitsMin !== 'undefined' ? props.unitsMin : ''}{' '}
                </span>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <div
        style={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          // gap: '0.75rem',
          textAlign: 'start',
          color: '#fff',
          display: 'flex',
        }}
      >
        {typeof props.disableCurrency === 'undefined' ? (
          <FormattedInput
            title={props.title}
            tooltip={props.tooltip}
            hasTooltip={props.hasTooltip}
            name={props.name}
            min={props.min}
            errorText={props.errorText}
            moreThan={props.moreThan}
            lessThan={props.lessThan}
            max={props.max}
            ttop={props.ttop}
            tleft={props.tleft}
            tright={props.tright}
            value={props.value.replaceAll(',', '')}
            handleChange={props.handleChange}
          />
        ) : (
          <FormattedInput
            disableCurrency={true}
            hasTooltip={props.hasTooltip}
            title={props.title}
            ttop={props.ttop}
            tleft={props.tleft}
            tright={props.tright}
            name={props.name}
            value={props?.value.replaceAll(',', '')}
            min={props.min}
            max={props.max}
            errorText={props.errorText}
            moreThan={props.moreThan}
            lessThan={props.lessThan}
            handleChange={props.handleChange}
          />
        )}

        <Ranger
          value={value}
          onInput={setValue}
          thumbsDisabled={[false, true]}
          rangeSlideDisabled={true}
          defaultValue={[0, 100]}
          className="single-thumb-ru"
        />

        {typeof props.disableRangeValues === 'undefined' ? (
          <div className={'range-ranges'}>
            <div style={{ position: 'relative', lineHeight: '140%' }}>
              <span className={props.name + 'Min'}>
                {props.min}{' '}
                {typeof props.unitsMin !== 'undefined' ? props.unitsMin : ''}{' '}
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                lineHeight: '140%',
                textAlign: 'left',
              }}
            >
              <span className={props.name + 'Max'}>
                {props.max}{' '}
                {typeof props.unitsMax !== 'undefined' ? props.unitsMax : ''}{' '}
              </span>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  )
}
