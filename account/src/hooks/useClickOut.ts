import { RefObject, useCallback, useEffect, useRef } from 'react'

/**
 * Хук useClickOut обрабатывает события клика вне определенного DOM-элемента.
 *
 * @param {useClickOutProps} options - Объект с настройками хука.
 * @returns {RefObject<HTMLElement>} - Ссылка на DOM-элемент.
 */

type useClickOutProps = {
  handleClickOut?: () => void
}

export const useClickOut = ({ handleClickOut }: useClickOutProps) => {
  // Создаем ссылку на DOM-элемент, который нужно отслеживать
  const ref = useRef(null) as RefObject<HTMLDivElement>

  // Функция для обработки клика вне элемента
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        handleClickOut
      ) {
        // Если клик произошел вне элемента и есть функция handleClickOut, вызываем ее
        handleClickOut()
      }
    },
    [handleClickOut]
  )

  // Добавляем обработчик события клика при монтировании компонента
  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    // Удаляем обработчик события клика при размонтировании компонента
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [handleClick, handleClickOut])

  // Возвращаем ссылку на DOM-элемент, который нужно отслеживать
  return ref
}
