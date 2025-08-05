import classNames from 'classnames/bind'
import { useRef, useState } from 'react'

import { InfoIcon } from '../../../assets/icons/InfoIcon'
import styles from './tooltip.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  tooltip: string
}

const Tooltip: React.FC<TypeProps> = ({ tooltip }: TypeProps) => {
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
    <div className={cx('tooltip')}>
      <InfoIcon onMouseEnter={handleOver} onMouseLeave={handleOut} />
      {isTooltipVisible && (
        <p onMouseEnter={handleOver} onMouseLeave={handleOut}>
          {tooltip}
        </p>
      )}
    </div>
  )
}

export default Tooltip
