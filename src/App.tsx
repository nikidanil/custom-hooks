import './App.css';
import { useHover } from './hooks';

export const App = () => {
	const { hovered, ref } = useHover<HTMLDivElement>();

	return <div ref={ref}>{hovered ? 'На меня навели мышку' : 'Наведи мышкой на меня'}</div>;
};
