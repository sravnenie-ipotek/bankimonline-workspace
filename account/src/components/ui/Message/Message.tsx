import classNames from 'classnames/bind'
import React from 'react'

import { CheckCircle } from '@assets/icons/Messages/CheckCircle'
import { WarningCircle } from '@assets/icons/Messages/WarningCircle'
import { WarningOctagon } from '@assets/icons/Messages/WarningOctagon'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './message.module.scss'

interface MessageProps {
  type: 'error' | 'info' | 'success' //тип сообщения
  max?: number //максимальная ширина в пискелях
  children: React.ReactNode //chidren
}

//стили прописаны не для всех условий в пропсах

const cx = classNames.bind(styles)

const Message: React.FC<MessageProps> = ({ type, max, children }) => {
  const theme = useTheme()
  const whiteIconColor = theme?.colors?.base.white
  const accentIconColor = theme?.colors?.accent.primary

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const messageClasses = {
    [type]: true, // Добавление css-класса, соответствующего выбранному type
    [styles.message]: true, // Добавление базового css-класса сообщения
  }

  return (
    <div className={cx(messageClasses)} style={{ maxWidth: `${max}px` }}>
      <div className={cx(isRussian ? 'iconMarginRight' : 'iconMarginLeft')}>
        {type === 'error' && <WarningOctagon color={whiteIconColor} />}
        {type === 'info' && <WarningCircle size={16} color={accentIconColor} />}
        {type === 'success' && <CheckCircle color={whiteIconColor} />}
      </div>
      <p className={cx('messageText')}>{children}</p>
    </div>
  )
}

export default Message
