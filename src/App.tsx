import './App.css';
import { useToggle } from './hooks';

export const App = () => {
	const [value, toggle] = useToggle(['blue', 'orange', 'cyan', 'teal']);

	return <button onClick={() => toggle()}>{String(value)}</button>;
};
