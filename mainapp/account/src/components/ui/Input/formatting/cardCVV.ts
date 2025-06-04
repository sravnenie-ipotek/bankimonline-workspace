export const formattingCardCVV = (value: string) => {
  const cleanedValue = value.replace(/\D/g, '')
  return cleanedValue.slice(0, 3)
}
export const unformattingCardCVV = (value: string) => {
  return value.replace(/\D/g, '')
}
