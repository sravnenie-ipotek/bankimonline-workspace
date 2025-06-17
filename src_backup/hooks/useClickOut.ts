import { useCallback, useEffect, useRef } from 'react'

type useClickOutProps = {
  handleClickOut?: () => void
}

export const useClickOut = ({ handleClickOut }: useClickOutProps) => {
  const ref = useRef<any>(null)

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        handleClickOut
      ) {
        handleClickOut()
      }
    },
    [handleClickOut]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [handleClick, handleClickOut])

  return ref
}
