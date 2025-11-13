import './App.css';
import { useFetch } from './hooks';

interface Post {
	userId: number;
	id: number;
	title: string;
	body: string;
}

export const App = () => {
	const { data, isLoading, error, refetch } = useFetch<Post[]>('https://jsonplaceholder.typicode.com/posts');

	return (
		<div>
			<div>
				<button onClick={() => refetch({ params: { _limit: 3 } })}>Перезапросить</button>
			</div>
			{isLoading && 'Загрузка...'}
			{error && 'Произошла ошибка'}
			{data && !isLoading && data.map((item) => <div key={item.id}>{item.title}</div>)}
		</div>
	);
};
