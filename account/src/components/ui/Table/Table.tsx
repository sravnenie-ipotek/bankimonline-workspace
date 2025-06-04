import classNames from 'classnames/bind'
import React from 'react'

import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './table.module.scss'

const cx = classNames.bind(styles)

interface TabProps {
  data: {
    titles: React.ReactNode[] // строка с заголовками таблицы
    rows: React.ReactNode[][] //строки таблицы
  }
}

const Table: React.FC<TabProps> = ({ data }) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  return (
    <div className={cx(styles.tablePlaya)}>
      <table className={cx(styles.tablePlate)}>
        <thead>
          <tr>
            {data.titles.map((title, index) => (
              <th
                className={cx(
                  styles.tableTitle,
                  isRussian ? 'text-left' : 'text-right'
                )}
                key={index}
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => (
            <tr key={index}>
              {row.map((rowValue, index) => (
                <th
                  className={cx(
                    styles.tableCell,
                    isRussian ? 'text-left' : 'text-right'
                  )}
                  key={index}
                >
                  {rowValue}
                </th>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
