type FormatSpecifier = 'date' | 'number'

function format(value: number | Date, format?: string, lng?: string): string {
  if (!format) return String(value)

  if (format.startsWith('date')) {
    return String(formatDate(value as Date, format, lng || 'ru'))
  }

  if (format.startsWith('number')) {
    return String(formatNumber(value as number, format, lng || 'ru'))
  }

  return String(value) // Convert value to string
}

function formatDate(value: Date, format: string, lng: string): string | Date {
  const options = toOptions(format, 'date')

  if (options === null) {
    return value
  }

  return new Intl.DateTimeFormat(lng, options).format(value)
}

function formatNumber(
  value: number,
  format: string,
  lng: string
): string | number {
  const options = toOptions(format, 'number')

  return options === null
    ? value
    : new Intl.NumberFormat(lng, options).format(value)
}

function toOptions(
  format: string,
  specifier: FormatSpecifier
): Intl.DateTimeFormatOptions | undefined {
  if (format.trim() === specifier) {
    return {}
  } else {
    try {
      return JSON.parse(toJsonString(format, specifier))
    } catch (error) {
      console.error(error)
      return undefined
    }
  }
}

function toJsonString(format: string, specifier: FormatSpecifier): string {
  const inner = format
    .trim()
    .replace(specifier, '')
    .replace('(', '')
    .replace(')', '')
    .split(';')
    .map((param) =>
      param
        .split(':')
        .map((name) => `"${name.trim()}"`)
        .join(':')
    )
    .join(',')

  return '{' + inner + '}'
}

export default format
