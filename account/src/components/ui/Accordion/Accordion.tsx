import classNames from 'classnames/bind'
import { FC, ReactNode, RefObject, useEffect, useRef, useState } from 'react'

import { CaretDown } from '@assets/icons/CaretDown'
import { useWindowResize } from '@src/hooks/useWindowResize'

import styles from './Accordion.module.scss'

type AccordinProps = {
  value: string
  children: string | ReactNode
}

const cx = classNames.bind(styles)

const Accordion: FC<AccordinProps> = ({ value, children }) => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const { isTablet, isMobile } = useWindowResize()

  const menuRef = useRef(null) as RefObject<HTMLElement>
  useEffect(() => {
    const chechClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', chechClickOutside)

    return () => {
      document.removeEventListener('mousedown', chechClickOutside)
    }
  }, [isOpen])

  return (
    <div className={cx('root')} ref={menuRef as RefObject<HTMLDivElement>}>
      <div className={cx('accordion_header')} onClick={() => setOpen(!isOpen)}>
        <div className={cx('accordion_value')}>{value}</div>
        <div
          className={cx(
            'accordion_caret',
            isOpen ? 'caret_open' : 'caret_close'
          )}
        >
          <CaretDown size={isTablet || isMobile ? 32 : 40} color="white" />
        </div>
      </div>
      {isOpen && (
        <div
          className={cx(
            'accordion_container',
            isOpen ? 'container_open' : 'container_close',
            'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default Accordion
