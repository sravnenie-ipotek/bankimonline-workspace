// Компонент подписи к календарю
const Title = (props: { title: string }) => {
  return (
    <div className={'custom-select-title'}>
      <div
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.38rem',
        }}
      >
        <div
          style={{
            position: 'relative',
            lineHeight: '140%',
            fontWeight: '500',
          }}
        >
          {props.title}
        </div>
      </div>
    </div>
  )
}

export default Title
