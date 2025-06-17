import { ErrorIcon } from '@assets/icons/ErrorIcon'

import styles from './ErrorBlock.module.scss'

interface IErrorBlockProps {
  error?: string | string[]
}
export function ErrorBlock({ error }: IErrorBlockProps) {
  return (
    <>
      {error && (
        <div className={styles.wrapper}>
          {(() => {
            switch (true) {
              case typeof error === 'string':
                return (
                  //TODO: change className
                  <div className={styles.wrapper}>
                    <ErrorIcon size={16} color="white" />
                    <span>{error}</span>
                  </div>
                )
              case Array.isArray(error) && !!error?.length:
                return (
                  <ul className={styles.list}>
                    {(error as string[]).map((item, index) => (
                      <li className={styles.item} key={`${item}_${index}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              default:
                return null
            }
          })()}
        </div>
      )}
    </>
  )
}
