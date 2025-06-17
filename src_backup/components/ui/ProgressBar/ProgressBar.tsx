import classNames from 'classnames/bind'
import { Fragment } from 'react'

import { CheckIcon } from '@assets/icons/CheckIcon'
import { useAppSelector } from '@src/hooks/store'

import styles from './progressBar.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  progress?: string
  data?: string[]
}
const ProgressBar: React.FC<TypeProps> = ({ progress, data }: TypeProps) => {
  const windowSize = useAppSelector((state) => state.windowSize.width)

  return (
    <div className={cx('progress')}>
      <div className={cx('wrapper')}>
        {data?.map((item, index) => (
          <Fragment key={index}>
            <div className={cx('progress-item')}>
              <div className={cx('progress-item__wrapper')}>
                <span
                  className={cx('progress-item__number', {
                    active: Number(progress) === index + 1,
                    checked: Number(progress) >= index + 2,
                  })}
                >
                  {Number(progress) >= index + 2 ? (
                    <CheckIcon color="#161616" />
                  ) : (
                    index + 1
                  )}
                </span>
                <p
                  className={cx('progress-item__text', {
                    activeText: Number(progress) === index + 1,
                    checkedText: Number(progress) >= index + 2,
                  })}
                >
                  {windowSize <= 1200 ? item.split(' ')[0] : item}
                  {/* обрезаем все слова и оставляем 1 для адаптива */}
                </p>
              </div>
            </div>
            {index < data.length - 1 && (
              <hr
                className={cx('progress-item__line', {
                  activeHr: Number(progress) === index + 2,
                  checkedHr: Number(progress) >= index + 2,
                })}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar
