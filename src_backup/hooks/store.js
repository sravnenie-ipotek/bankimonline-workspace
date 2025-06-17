import { useDispatch, useSelector } from 'react-redux';
// Использовать во всём приложении вместо обычных `useDispatch` и `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
