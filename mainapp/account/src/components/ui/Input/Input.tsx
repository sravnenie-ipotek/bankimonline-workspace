import classNames from 'classnames/bind'
import { Field } from 'formik'

import { Message } from '../Message'
import { formattingDefault, unformattingDefault } from './formatting/default'
import styles from './input.module.scss'

interface InputProps {
  size?: 'small' | 'medium' // размер поля: высота 36|46 (по умолчанию 46)
  variant?: 'default' | 'square' // вид поля: стандартный или куб для воода кода (по умолчанию стандартный)
  format?:
    | 'default'
    | 'price'
    | 'date'
    | 'password'
    | 'find'
    | 'phone'
    | 'mail'
    | 'CVV' // определяет набор элементов и форматирование в поле (по умолчанию стандартный)
  type?: 'text' | 'password' | 'number' | undefined // Тип поля (text, password)
  disabled?: boolean // Флаг, указывающий, заблокированно ли поле
  title?: string // заголовок поля
  name: string // имя элемента для его контроля формой
  placeholder: string // placeholder
  className?: string // дополнительные CSS-классы
  error?: string // обработка ошибок валидации
  touched?: boolean // обработка ошибок валидации
  max?: number // максимальный размер сообщения об ошибке
  formatting?: (input: string) => string //форматирование текста для отображения (по умолчанию функция без форматирования)
  unformatting?: (input: string) => string //разформатирование текста для записи в форму (по умолчанию функция без форматирования)
}

//стили прописаны не для всех условий в пропсах

interface FormProps {
  field: {
    value: string
  }
  form: {
    setFieldValue: (field: string, value: string) => void
  }
}

const cx = classNames.bind(styles)

const Input: React.FC<InputProps> = ({
  size = 'medium',
  variant = 'default',
  format = 'default',
  type,
  disabled,
  title,
  name,
  placeholder,
  className,
  error,
  touched,
  max,
  formatting = formattingDefault,
  unformatting = unformattingDefault,
}: InputProps) => {
  const inputClasses = {
    [styles.input]: true, // Добавление базового css-класса поля
    [variant]: true, // Добавление css-класса, соответствующего выбранному variant
    [size]: true, // Добавление css-класса, соответствующего выбранному size
  }

  return (
    <div className="flex-col">
      {title && <p className={cx('inputTitle')}>{title}</p>}
      <div className={cx('inputPlate')}>
        <Field name={name}>
          {({ field, form }: FormProps) => (
            <input
              className={cx(inputClasses, className)}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={formatting(field.value)}
              onChange={(e) => {
                form.setFieldValue(name, unformatting(e.target.value))
              }}
            />
          )}
        </Field>
        {
          format === 'default' && null //здесь добавлять элементы в зависимости от format
        }
        {error && touched ? (
          <Message type="error" max={max}>
            {error}
          </Message>
        ) : null}
      </div>
    </div>
  )
}

export default Input
