import { useCallback, useEffect, useState } from 'react';

/**
 * Параметры для добавления query-строки к URL.
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
	 */
	params?: {
		[key: string]: string | number | boolean;
	};
};

/**
 * Полные опции для выполнения HTTP-запроса.
 * Расширяет {@link OptionsParams}, добавляя метод, заголовки и тело.
 */
type FetchOptions = OptionsParams & {
	/**
	 * HTTP-метод запроса. По умолчанию — 'GET'.
	 * Поддерживаются стандартные методы: GET, POST, PUT, DELETE.
	 */
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

	/**
	 * Заголовки HTTP-запроса.
	 * Будут объединены с заголовком по умолчанию `Content-Type: application/json`.
	 *
	 * @example
	 * ```ts
	 * { 'Authorization': 'Bearer token123' }
	 * ```
	 */
	headers?: Record<string, string>;

	/**
	 * Тело запроса. Может быть объектом или строкой.
	 * Автоматически сериализуется в JSON (если объект) для методов POST, PUT.
	 *
	 * Для GET и DELETE игнорируется.
	 */
	body?: Record<string, unknown> | string;
};

/**
 * Универсальный хук для выполнения HTTP-запросов в React-компонентах.
 *
 * Поддерживает:
 * - GET, POST, PUT, DELETE
 * - Параметры URL, заголовки, тело
 * - Отмену запросов (через AbortController)
 * - Повторный запрос (refetch)
 * - Типизацию результата через дженерик
 *
 * @template T - Тип ожидаемых данных в ответе (например, User[], Post и т.д.)
 *
 * @param initialUrl - Базовый URL для запроса
 * @param initialOptions - Необязательные параметры запроса по умолчанию
 *
 * @returns Объект с состоянием запроса и функцией повторного запроса
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useFetch<User[]>('/api/users');
 *
 * return (
 *   <div>
 *     {isLoading ? 'Загрузка...' : data?.map(u => <div key={u.id}>{u.name}</div>)}
 *     <button onClick={() => refetch({ params: { page: 2 } })}>Следующая страница</button>
 *   </div>
 * );
 * ```
 */
export const useFetch = <T>(initialUrl: string, initialOptions?: FetchOptions) => {
	/**
	 * Хранит данные, полученные от сервера.
	 * Изначально null, обновляется после успешного запроса.
	 */
	const [data, setData] = useState<T | null>(null);

	/**
	 * Флаг состояния загрузки.
	 * true — идёт запрос, false — запрос завершён или не начат.
	 */
	const [isLoading, setIsLoading] = useState<boolean>(false);

	/**
	 * Хранит сообщение об ошибке или null, если ошибки нет.
	 */
	const [error, setError] = useState<null | string>(null);

	/**
	 * Хранит текущий AbortController для отмены активного запроса.
	 * Используется для предотвращения обновления состояния в размонтированном компоненте.
	 */
	const [abortController, setAbortController] = useState<AbortController | null>(null);

	/**
	 * Основная функция для выполнения HTTP-запроса.
	 *
	 * @param url - URL для запроса (может отличаться от initialUrl при refetch)
	 * @param options - Опции запроса (параметры, метод, заголовки, тело)
	 *
	 * @remarks
	 * - Отменяет предыдущий запрос перед запуском нового
	 * - Устанавливает состояние загрузки и сбрасывает ошибку
	 * - Формирует URL с query-параметрами
	 * - Выполняет fetch с переданными настройками
	 * - Обрабатывает ошибки, включая отмену запроса
	 * - Обновляет состояние только если запрос не был отменён
	 */
	const fetchData = useCallback(
		async (url: string, options: FetchOptions = {}) => {
			// Отменяем предыдущий активный запрос (если был)
			abortController?.abort();

			// Создаём новый контроллер для текущего запроса
			const controller = new AbortController();
			setAbortController(controller);

			// Устанавливаем состояние загрузки
			setIsLoading(true);
			setError(null);

			try {
				// Формируем URL и добавляем query-параметры
				const urlObj = new URL(url);

				if (options.params) {
					Object.entries(options.params).forEach(([key, value]) => {
						urlObj.searchParams.set(key, value.toString());
					});
				}

				// Деструктурируем опции запроса
				const { method = 'GET', headers = {}, body } = options;

				// Формируем конфигурацию для fetch
				const config: RequestInit = {
					method,
					headers: {
						'Content-Type': 'application/json',
						...headers,
					},
					signal: controller.signal, // подключаем сигнал отмены
					...(body && { body: JSON.stringify(body) }), // добавляем тело, если есть
				};

				// Выполняем запрос
				const response = await fetch(urlObj, config);

				// Проверяем статус ответа
				if (!response.ok) {
					throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
				}

				// Парсим JSON-ответ
				const result: T = await response.json();

				// Устанавливаем данные, только если запрос не был отменён
				if (!controller.signal.aborted) {
					setData(result);
				}
			} catch (error) {
				// Если запрос был отменён — не устанавливаем ошибку
				if (controller.signal.aborted) {
					console.log('Запрос отменен');
					return;
				}
				// Устанавливаем сообщение об ошибке
				if (error instanceof Error) {
					setError(error.message);
				}
			} finally {
				// Сбрасываем состояние загрузки, если запрос не отменён
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
				// Очищаем AbortController, если он ещё актуален
				if (controller === abortController) {
					setAbortController(null);
				}
			}
		},
		[abortController] // Пересоздаётся при изменении AbortController
	);

	/**
	 * Функция для повторного выполнения запроса.
	 * Полезна для обновления данных по действию пользователя.
	 *
	 * @param options - Дополнительные или переопределяющие опции запроса
	 *
	 * @example
	 * ```ts
	 * refetch({ params: { page: 2, limit: 10 } });
	 * refetch({ method: 'POST', body: { name: 'Новый пользователь' } });
	 * ```
	 */
	const refetch = useCallback(
		(options: FetchOptions = {}) => {
			fetchData(initialUrl, { ...initialOptions, ...options });
		},
		[fetchData, initialOptions, initialUrl]
	);

	/**
	 * Эффект для выполнения первого запроса при монтировании.
	 *
	 * @remarks
	 * fetchData исключён из зависимостей, чтобы избежать бесконечного цикла
	 * из-за пересоздания функции при изменении abortController.
	 *
	 * Используется подавление правила ESLint, так как fetchData гарантированно доступна.
	 */
	useEffect(() => {
		fetchData(initialUrl, initialOptions);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialOptions, initialUrl]);

	/**
	 * Эффект для отмены активного запроса при размонтировании компонента.
	 *
	 * @remarks
	 * Вызывается cleanup-функция, которая отменяет текущий запрос,
	 * предотвращая обновление состояния в уничтоженном компоненте.
	 */
	useEffect(() => {
		return () => {
			abortController?.abort();
		};
	}, [abortController]);

	/**
	 * Возвращаем публичный интерфейс хука.
	 *
	 * @returns Объект с:
	 * - data: полученными данными
	 * - isLoading: флагом загрузки
	 * - error: сообщением об ошибке
	 * - refetch: функцией для повторного запроса
	 */
	return { data, isLoading, error, refetch };
};
