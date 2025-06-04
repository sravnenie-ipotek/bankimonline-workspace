import classNames from 'classnames/bind'
import { FC, useRef, useState } from 'react'

import { InfoIcon } from '../../../assets/icons/InfoIcon'
import styles from './titleElement.module.scss'

const cx = classNames.bind(styles)

interface TitleElementProps {
  title?: string
  name?: string
  tooltip?: boolean | string
}

const TitleElement: FC<TitleElementProps> = ({ title, tooltip }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const handleOver = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    setTooltipVisible(true)
  }

  const handleOut = () => {
    timer.current = setTimeout(() => {
      setTooltipVisible(false)
    }, 200)
  }

  return (
    <>
      <div className={cx('title')}>
        <span className={cx('title-text')}>{title}</span>
        {tooltip && (
          <>
            <InfoIcon
              className={cx('tooltip-icon')}
              onMouseEnter={handleOver}
              onMouseLeave={handleOut}
              size={20}
            />
            {isTooltipVisible && (
              <div
                onMouseEnter={handleOver}
                onMouseLeave={handleOut}
                className={cx(
                  'tt',
                  'scrollbar scrollbar-thumb-base-secondaryHoveredButton scrollbar-thumb-rounded-md scrollbar-w-1'
                )}
              >
                {tooltip}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default TitleElement
