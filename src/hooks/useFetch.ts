import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Параметры для добавления query-строки к URL.
 *
 * Позволяет передавать объект параметров, которые будут преобразованы в строку запроса.
 *
 * @example
 * ```ts
 * { params: { page: 1, search: "term", active: true } }
 * // → ?page=1&search=term&active=true
 * ```
 */
type OptionsParams = {
	/**
	 * Объект с параметрами, которые будут добавлены к URL как query-параметры.
	 * Поддерживаются строки, числа и булевы значения.
	 * Каждое значение автоматически преобразуется в строку при добавлении в URL.
	 */
	params?: {
		[key: string]: string | number | boolean;
	};
};

/**
 * Полные опции для выполнения HTTP-запроса.
 *
 * Расширяет {@link OptionsParams}, добавляя поддержку HTTP-метода, заголовков и тела запроса.
 */
type FetchOptions = OptionsParams & {
	/**
	 * HTTP-метод запроса. По умолчанию используется 'GET'.
	 * Поддерживаются стандартные методы: GET, POST, PUT, DELETE.
	 * Для GET и DELETE тело запроса игнорируется.
	 */
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

	/**
	 * Заголовки HTTP-запроса.
	 * Будут объединены с заголовком по умолчанию `Content-Type: application/json`.
	 * Пользовательские заголовки имеют приоритет при конфликте имён.
	 *
	 * @example
	 * ```ts
	 * { 'Authorization': 'Bearer token123' }
	 * ```
	 */
	headers?: Record<string, string>;

	/**
	 * Тело запроса. Может быть объектом или строкой.
	 * Для методов POST и PUT автоматически сериализуется в JSON, если передан объект.
	 * Для методов GET и DELETE тело игнорируется.
	 *
	 * При сериализации объекта проверяются циклические ссылки.
	 */
	body?: Record<string, unknown> | string;
};

/**
 * Универсальный хук для выполнения HTTP-запросов в React-компонентах.
 *
 * Инкапсулирует логику выполнения запросов с поддержкой:
 * - Основных HTTP-методов: GET, POST, PUT, DELETE
 * - Динамических параметров URL, заголовков и тела
 * - Отмены запросов с использованием AbortController
 * - Повторного выполнения запроса (refetch)
 * - Полной типизации результата через дженерик
 * - Управления состоянием загрузки и ошибок
 *
 * Хук автоматически отменяет предыдущий запрос при запуске нового,
 * а также при размонтировании компонента, предотвращая утечки памяти и обновления состояния у несуществующих компонентов.
 *
 * @template T - Тип данных, ожидаемых в ответе от сервера (например, User[], Post, и т.д.)
 *
 * @param initialUrl - Базовый URL-адрес для выполнения HTTP-запроса. Обязательный параметр.
 * @param initialOptions - Необязательные параметры запроса по умолчанию. Будут использованы при первоначальном вызове и как база для refetch.
 *
 * @returns Возвращает объект с текущим состоянием запроса:
 * - `data` — полученные данные или `null`, если данные ещё не загружены
 * - `isLoading` — флаг, указывающий, выполняется ли запрос в данный момент
 * - `error` — текст ошибки, если запрос завершился неудачно, или `null`
 * - `refetch` — функция для повторного выполнения запроса с опциями
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useFetch<User[]>('/api/users');
 *
 * return (
 *   <div>
 *     {isLoading ? 'Загрузка...' : data?.map(u => <div key={u.id}>{u.name}</div>)}
 *     {error && <p>Ошибка: {error}</p>}
 *     <button onClick={() => refetch({ params: { page: 2 } })}>Следующая страница</button>
 *   </div>
 * );
 * ```
 */
export const useFetch = <T>(initialUrl: string, initialOptions?: FetchOptions) => {
	// Хранение результата запроса
	const [data, setData] = useState<T | null>(null);
	// Флаг состояния загрузки
	const [isLoading, setIsLoading] = useState<boolean>(false);
	// Хранение сообщения об ошибке
	const [error, setError] = useState<string | null>(null);

	// Ссылка для хранения AbortController, чтобы избежать перерисовки при его изменении
	const abortControllerRef = useRef<AbortController | null>(null);

	// Стабильная асинхронная функция для выполнения запроса, не пересоздаётся при каждом рендере
	const fetchData = useCallback(async (url: string, options: FetchOptions = {}) => {
		// 1. Проверка на наличие URL
		if (!url) {
			setError('URL не может быть пустым');
			return;
		}

		try {
			// 2. Отмена предыдущего активного запроса
			abortControllerRef.current?.abort();

			// 3. Создание нового контроллера отмены и сохранение его в ref
			const controller = new AbortController();
			abortControllerRef.current = controller;

			// 4. Установка состояния: запрос начался
			setIsLoading(true);
			setError(null);

			// 5. Формирование полного URL с query-параметрами
			const urlObj = new URL(url);
			if (options.params) {
				Object.entries(options.params).forEach(([key, value]) => {
					urlObj.searchParams.set(key, value.toString());
				});
			}

			// 6. Извлечение параметров запроса с значениями по умолчанию
			const { method = 'GET', headers = {}, body } = options;

			// 7. Сериализация тела запроса (только для POST и PUT)
			let bodyString: string | undefined;
			if (body && (method === 'POST' || method === 'PUT')) {
				try {
					bodyString = JSON.stringify(body);
				} catch (err) {
					setError(
						'Не удалось сериализовать тело запроса: ' + (err instanceof Error ? err.message : String(err))
					);
					setIsLoading(false);
					return;
				}
			}

			// 8. Формирование конфигурации для fetch
			const config: RequestInit = {
				method,
				headers: {
					'Content-Type': 'application/json',
					...headers,
				},
				signal: controller.signal,
				...(bodyString && { body: bodyString }),
			};

			// 9. Выполнение HTTP-запроса
			const response = await fetch(urlObj.toString(), config);

			// 10. Проверка успешности ответа по HTTP-статусу
			if (!response.ok) {
				throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
			}

			// 11. Чтение тела ответа как текста (для проверки на пустоту)
			const text = await response.text();
			// Парсинг JSON, если тело не пустое; иначе — null
			const result: T = text ? JSON.parse(text) : null;

			// 12. Обновление состояния данными, только если запрос не был отменён
			if (!controller.signal.aborted) {
				setData(result);
			}
		} catch (err) {
			// 13. Обработка отмены запроса
			if ((err as Error).name === 'AbortError') {
				console.debug('Запрос был отменён');
				return;
			}

			// 14. Установка сообщения об ошибке
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Неизвестная ошибка');
			}
		} finally {
			// 15. Сброс флага загрузки, если запрос не был отменён
			if (!abortControllerRef.current?.signal.aborted) {
				setIsLoading(false);
			}
		}
	}, []);

	// Функция для повторного выполнения запроса с новыми опциями
	const refetch = useCallback(
		(options?: FetchOptions) => {
			fetchData(initialUrl, { ...initialOptions, ...options });
		},
		[fetchData, initialUrl, initialOptions]
	);

	// Эффект: выполнение первого запроса при монтировании или изменении зависимостей
	useEffect(() => {
		if (initialUrl) {
			fetchData(initialUrl, initialOptions);
		}
	}, [initialUrl, initialOptions, fetchData]);

	// Эффект: отмена текущего запроса при размонтировании компонента
	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
		};
	}, []);

	// Возврат публичного интерфейса хука
	return { data, isLoading, error, refetch };
};
