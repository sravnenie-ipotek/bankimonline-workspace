import Control from './Control.tsx'
import Title from './Title.tsx'

interface CustomSelectProps {
  name: string
  values: (string | object)[]
  title?: string
  placeholder?: string
  direction?: 'ltr' | 'rtl'
  options: string[]
  onChange: (value: string | object) => void
}

export default function CustomSelect({
  name,
  values,
  title,
  placeholder,
  direction,
  options,
  onChange,
}: CustomSelectProps): JSX.Element {
  const ControlSelect = Control({ name })

  if (typeof values !== 'undefined' && values && values[0] !== '') {
    return (
      <>
        {typeof title !== 'undefined' ? <Title title={title} /> : <></>}
        <ControlSelect
          valueField="value"
          name={name}
          searchable={false}
          className={name}
          placeholder={placeholder}
          direction={direction}
          options={options}
          onChange={onChange}
          values={values}
        />
      </>
    )
  }

  return (
    <>
      {typeof title !== 'undefined' ? <Title title={title} /> : <></>}
      <ControlSelect
        values={values}
        valueField="value"
        name={name}
        searchable={false}
        className={name}
        placeholder={placeholder}
        direction={direction}
        options={options}
        onChange={onChange}
      />
    </>
  )
}
