type TimerId = ReturnType<typeof setTimeout>

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  timeout = 300
): (...args: Parameters<T>) => void {
  let timer: TimerId

  return function (this: unknown, ...args: Parameters<T>): void {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}
