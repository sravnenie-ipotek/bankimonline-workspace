export const formattingCardNumber = (value: string) => {
  const cleanedValue = value.replace(/\D/g, '')
  const formattedValue = cleanedValue.match(/.{1,4}/g)?.join(' ') || ''
  return formattedValue.slice(0, 19)
}
export const unformattingCardNumber = (value: string) => {
  return value.replace(/\D/g, '')
}
