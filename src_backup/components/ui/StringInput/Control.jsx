import React, { useEffect } from 'react'

// Компонент для ввода строк
export default function StringInput(props) {
  // обработка ввода данных
  let handleInput = (e) => {
    let res = patternMatch({
      input: e.target.value,
      key: e.nativeEvent.data,
    })
    if (res !== false) {
      e.target.value = res
    }
    props.handleChange(res)

    if (!res.length) {
      document
        .getElementsByClassName('error-' + props.name)[0]
        .classList.remove('error-noborder')
      document
        .getElementsByClassName('error-' + props.name)[0]
        .classList.add('error-border')
      document
        .getElementsByClassName('errortext-' + props.name)[0]
        .classList.remove('hidden')
    } else {
      document
        .getElementsByClassName('error-' + props.name)[0]
        .classList.add('error-noborder')
      document
        .getElementsByClassName('error-' + props.name)[0]
        .classList.remove('error-border')
      document
        .getElementsByClassName('errortext-' + props.name)[0]
        .classList.add('hidden')
    }
  }

  function patternMatch({ input, key }) {
    return input
  }

  useEffect(() => {
    requestAnimationFrame(function () {
      props.handleChange(props.value)
    }, 1)
  })

  return (
    <>
      <div>
        <div
          style={{
            // alignSelf: 'stretch',
            overflow: 'hidden',
            // display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
          className={'error-' + props.name + ' error-noborder'}
        >
          <div
            style={{
              borderRadius: '6px',
              backgroundColor: '#2a2b31',
              border: '1px solid #333535',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              paddingTop: '0',
              paddingBottom: '0',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                // paddingLeft: '1rem',
                // paddingRight: '1rem',
                position: 'relative',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <input
                style={{
                  position: 'relative',
                  fontWeight: '500',
                  display: 'inline-block',
                  // width: '100%',
                  flexShrink: '0',
                  textAlign: '-webkit-auto',
                  background: 'transparent',
                  color: '#FFF',
                  outline: 'none',
                  border: 'none',
                  fontSize: '20px',
                  height: '2.75rem',
                  paddingLeft: '1rem',
                }}
                className={props.name}
                type="text"
                maxLength="19"
                placeholder={props.placeholder}
                onInput={handleInput}
              />
            </div>
          </div>
        </div>
        <div
          className={'errortext-' + props.name + ' error hidden'}
          style={{
            fontSize: '12px',
            marginTop: '1rem',
            padding: '8px',
            borderRadius: '6px',
          }}
        >
          {props.errorText}
        </div>
      </div>
    </>
  )
}
