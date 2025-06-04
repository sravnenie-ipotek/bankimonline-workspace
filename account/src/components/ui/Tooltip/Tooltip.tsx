import classNames from 'classnames/bind'
import ReactDOM from 'react-dom'

import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './tooltip.module.scss'

interface TooltipProps {
  x: number //координаты в пикселях
  y: number //координаты в пикселях
  content: string //послание
  visibility: boolean //видимость
}

const tooltipRoot = document.getElementById('tooltip-root')

const Tooltip: React.FC<TooltipProps> = ({
  x,
  y,
  content,
  visibility,
}: TooltipProps) => {
  const cx = classNames.bind(styles)

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  if (!tooltipRoot) return null

  return ReactDOM.createPortal(
    visibility ? (
      <div
        className={cx(styles.tooltipPlate)}
        style={{ top: `${y}px`, [isRussian ? 'left' : 'right']: `${x}px` }}
      >
        <div className={cx(styles.tooltipRectangle)} />
        <div className={cx(styles.tooltipMainPlate)}>
          <p className={cx(styles.tooltipMessage)}>{content}</p>
        </div>
      </div>
    ) : (
      <></>
    ),
    tooltipRoot
  )
}

export default Tooltip
