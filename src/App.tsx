import './App.css';
import { useViewportSize } from './hooks';

export const App = () => {
	const { height, width } = useViewportSize();

	return (
		<>
			Width: {width}, height: {height}
		</>
	);
};
