import './App.css';
import { useWindowScroll } from './hooks';

export const App = () => {
	const { scroll, scrollTo } = useWindowScroll();

	return (
		<div className='box'>
			<p>
				Scroll position x: {scroll.x}, y: {scroll.y}
			</p>
			<button onClick={() => scrollTo({ y: 0 })}>Scroll to top</button>
		</div>
	);
};
