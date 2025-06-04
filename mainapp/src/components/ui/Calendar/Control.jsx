// Компонент поля календаря, для ввода значений
export default function Control() {
  return (
    <div
      style={{
        alignSelf: 'stretch',
        borderRadius: '4px',
        backgroundColor: '#2a2b31',
        border: '1px solid #333535',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem 1.5rem',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        fontSize: '1rem',
        color: '#848484',
        width: '100%',
      }}
    >
      <div
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <img
          style={{
            position: 'relative',
            width: '1.5rem',
            height: '1.5rem',
            margin: '0',
          }}
          alt=""
          // src="/static/calculate-credit/2/calendarblank.svg"
        />
        <div style={{ position: 'relative', lineHeight: '140%' }}>
          DD/MM/YYYY
        </div>
      </div>
    </div>
  )
}
