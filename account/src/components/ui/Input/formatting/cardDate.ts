export const formattingCardDate = (value: string) => {
  const cleanedValue = value.replace(/\D/g, '')
  if (cleanedValue.length > 2) {
    const formattedValue =
      cleanedValue.slice(0, 2) + ' / ' + cleanedValue.slice(2)
    return formattedValue.slice(0, 7)
  }

  return cleanedValue.slice(0, 7)
}
export const unformattingCardDate = (value: string) => {
  return value.replace(/[\s/]/g, '')
}
