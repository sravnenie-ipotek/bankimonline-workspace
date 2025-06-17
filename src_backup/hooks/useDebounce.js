import { useEffect, useState } from 'react';
/**
 * Хук для задержки обновления значения. Полезен, например, при оптимизации поисковых запросов
 * или других операций, которые не должны выполняться при каждом изменении значения.
 *
 * @param {T} value - значение, которое нужно задержать.
 * @param {number} delay - время задержки в миллисекундах.
 * @returns {T} - задержанное значение.
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Очистка таймаута при размонтировании или при изменении value или delay
        return () => {
            clearTimeout(timeoutId);
        };
    }, [value, delay]);
    return debouncedValue;
}
export default useDebounce;
// Пример использования
/*
const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Задержка в 500 мс

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Выполнение поискового запроса здесь
      console.log(`Sending a request with term: ${debouncedSearchTerm}`);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder="Start typing..."
    />
  );
}
*/
