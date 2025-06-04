import { useCallback, useEffect, useRef } from 'react'

export default function useOutsideClick(handleOutsideClick: any) {
  const ref = useRef(null)

  const onClick = useCallback(
    (event: unknown) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (ref.current?.contains && !ref.current?.contains(event.target)) {
        handleOutsideClick()
      }
    },
    [handleOutsideClick]
  )

  useEffect(() => {
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [onClick])

  return ref
}
