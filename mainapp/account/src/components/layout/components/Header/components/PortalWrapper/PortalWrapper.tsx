import React, { ReactNode, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div')
  wrapperElement.setAttribute('id', wrapperId)
  document.body.appendChild(wrapperElement)
  return wrapperElement
}

type PortalWrapperProps = {
  children: ReactNode
  targetId: string
}

const PortalWrapper: React.FC<PortalWrapperProps> = ({
  children,
  targetId = 'react-portal-wrapper',
}) => {
  const [wrapperElement, setWrapperElement] = useState(null)

  useLayoutEffect(() => {
    let element = document.getElementById(targetId) as any
    let systemCreated = false
    // if element is not found with wrapperId or wrapperId is not provided,
    // create and append to body
    if (!element) {
      systemCreated = true
      element = createWrapperAndAppendToBody(targetId)
    }
    setWrapperElement(element)

    return () => {
      // delete the programmatically created element
      if (systemCreated && element.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [targetId])

  // wrapperElement state will be null on very first render.
  if (wrapperElement === null) return null

  return createPortal(children, wrapperElement)
}

export default PortalWrapper
