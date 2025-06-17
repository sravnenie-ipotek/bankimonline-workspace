import TitleElement from '../TitleElement/TitleElement'
import { Dropdown } from './Dropdown'

type DropdownValue = { value: string; label: string }

interface DropdownProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'data' | 'value' | 'onChange'> {
  data: Array<DropdownValue>
  title?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  searchable?: boolean
  searchPlaceholder?: string
  nothingFoundText?: string
  error?: boolean | unknown | string
  className?: string
}

const DropdownMenu = ({
  data,
  title,
  placeholder,
  onChange,
  value,
  searchable,
  searchPlaceholder,
  nothingFoundText,
  onBlur,
  error,
  className,
}: DropdownProps) => {
  return (
    <>
      {title && <TitleElement title={title} />}
      <Dropdown
        data={data}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        nothingFoundText={nothingFoundText}
        onBlur={onBlur}
        error={error as string}
        className={className}
      />
    </>
  )
}

export default DropdownMenu
