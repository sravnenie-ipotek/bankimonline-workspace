import cn from 'classnames'

import styles from './Tabs.module.scss'

interface ITabProps<T> {
  handleChange: (value: T) => unknown
  tab: T
  tabs: ITabs<T>[]
}

export interface ITabs<T> {
  value: T
  label: string
}

export function Tabs<T>({ handleChange, tab, tabs }: ITabProps<T>) {
  return (
    <div className={styles.tabs}>
      {tabs.map(({ value, label }, index) => (
        <div
          key={`${value}_${index}`}
          onClick={() => handleChange(value)}
          className={cn(styles.itemTab, {
            [styles.active]: tab === value,
          })}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
