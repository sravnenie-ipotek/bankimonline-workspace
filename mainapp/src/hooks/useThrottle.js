import { useEffect, useRef } from 'react';
/**
 * useThrottle
 * @param value - значение, которое нужно "задержать"
 * @param delay - задержка в миллисекундах
 * @returns - задержанное значение
 */
function useThrottle(value, delay) {
    const throttledValueRef = useRef(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            throttledValueRef.current = value;
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return throttledValueRef.current;
}
export default useThrottle;
// Пример использования
/*

const SearchComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const throttledSearchTerm = useThrottle(searchTerm, 300);

  useEffect(() => {
    if (throttledSearchTerm) {
      // Выполнение запроса к API или другую логику здесь
      console.log(`Searching for: ${throttledSearchTerm}`);
    }
  }, [throttledSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};

export default SearchComponent;

 */
