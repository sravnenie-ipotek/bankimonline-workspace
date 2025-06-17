// subcomponents/Handle.tsx
import React from 'react'

interface HandleProps {
  handle: {
    id: string
    value: number
    percent: number
  }
  domain: [number, number]
  getHandleProps: (id: string) => any
}

const Handle: React.FC<HandleProps> = ({
  handle: { id, value, percent },
  getHandleProps,
}) => {
  return (
    <div
      style={{
        left: `${percent}%`,
        position: 'absolute',
        marginLeft: '-15px',
        marginTop: '-6px',
        zIndex: 2,
        width: 30,
        height: 16,
        border: 0,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        backgroundColor: '#2C3E50',
        color: '#fff',
      }}
      {...getHandleProps(id)}
    >
      <div style={{ fontSize: '11px', marginTop: '1px' }}>{value}</div>
    </div>
  )
}

export default Handle
