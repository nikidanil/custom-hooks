import { useReducer } from 'react';

/**
 * Кастомный хук для переключения между двумя состояниями.
 *
 * @overload
 * В режиме без аргументов переключает булево значение `true`/`false`.
 * @returns Массив, где первый элемент — текущее значение (`boolean`), второй — функция переключения.
 *
 * @example
 * ```ts
 * const [isOpen, toggle] = useToggle();
 * toggle();        // Переключает между true и false
 * toggle(true);    // Устанавливает значение явно
 * ```
 *
 * @overload
 * При передаче массива значений переключается циклически между ними.
 * @param values - Массив значений, между которыми будет происходить переключение.
 *               Должен быть readonly (рекомендуется использовать `as const`).
 * @returns Массив, где первый элемент — текущее значение из списка (`T[number]`),
 *          второй — функция переключения.
 *
 * @example
 * ```ts
 * const [mode, toggleMode] = useToggle(['light', 'dark'] as const);
 * toggleMode();           // Циклически переключает: 'light' → 'dark' → 'light' → ...
 * toggleMode('light');    // Устанавливает значение явно
 * ```
 *
 * @param values - Необязательный массив значений. Если не передан — используется булев режим.
 * @returns Кортеж:
 * - `value`: текущее значение (`boolean` или один из элементов `values`).
 * - `toggle`: функция для переключения:
 *   - Без аргумента — переходит к следующему значению (в булевом режиме — инвертирует).
 *   - С аргументом — устанавливает указанное значение (только если оно присутствует в `values`).
 *
 * @template T - Тип значений в массиве. Выводится автоматически как readonly кортеж.
 *
 * @throws В режиме с массивом значения, не входящие в `values`, игнорируются.
 *
 * @remarks
 * - В булевом режиме начальное значение — `false`.
 * - В режиме массива начальное значение — первый элемент `values`.
 * - Использует `useReducer` для управления состоянием.
 * - Поддерживает полную типобезопасность через перегрузки и вывод типов.
 *
 * @see https://react.dev/reference/react/useReducer
 */
export function useToggle(): [boolean, (value?: boolean) => void];

/**
 * Перегрузка хука для работы с массивом значений.
 * @param values - readonly массив значений для циклического переключения.
 * @returns Кортеж с текущим значением и функцией переключения.
 */
export function useToggle<const T extends readonly unknown[]>(values: T): [T[number], (value?: T[number]) => void];

/**
 * Реализация хука `useToggle`.
 * @internal
 */
export function useToggle<const T extends readonly unknown[]>(
	values?: T
): [T[number] | boolean, (value?: T[number] | boolean) => void] {
	const isBooleanMode = !values || values.length === 0;

	// Тип состояния в булевом режиме
	type BooleanState = { value: boolean };
	// Тип состояния в режиме переключения значений
	type ValueModeState = { value: T[number]; index: number };
	// Объединённый тип состояния
	type State = BooleanState | ValueModeState;

	// Допустимые действия
	type Action = { type: 'TOGGLE' } | { type: 'SET'; payload: T[number] };

	/**
	 * Функция-редьюсер для обновления состояния.
	 * @param state - Текущее состояние.
	 * @param action - Выполняемое действие.
	 * @returns Новое состояние.
	 */
	const reducer = (state: State, action: Action): State => {
		// В булевом режиме — просто инвертируем значение
		if (isBooleanMode) {
			return { value: !(state as BooleanState).value };
		}

		// В режиме значений — работаем с индексом
		const s = state as ValueModeState;

		switch (action.type) {
			case 'TOGGLE':
				// Циклическое переключение: следующий индекс, с возвратом к 0
				return {
					value: values[(s.index + 1) % values.length],
					index: (s.index + 1) % values.length,
				};

			case 'SET': {
				// Установка значения по индексу, если оно существует в массиве
				const index = values.indexOf(action.payload);
				if (index !== -1) {
					return { value: action.payload, index };
				}
				// Если значение не найдено — сохраняем текущее состояние
				return s;
			}

			default:
				// По умолчанию — не меняем состояние
				return state;
		}
	};

	/**
	 * Функция инициализации начального состояния.
	 * @returns Начальное состояние в зависимости от режима.
	 */
	const getInitialState = (): State => {
		if (isBooleanMode) {
			return { value: false };
		}
		return { value: values[0], index: 0 };
	};

	// Инициализация редьюсера
	const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

	/**
	 * Функция переключения состояния.
	 * @param nextValue - Необязательное значение для установки.
	 *                  В булевом режиме — только `boolean`.
	 *                  В режиме массива — должно быть одним из `values`.
	 */
	const toggle = (nextValue?: T[number] | boolean) => {
		if (isBooleanMode) {
			dispatch({ type: 'TOGGLE' });
			return;
		}

		if (nextValue !== undefined) {
			// Устанавливаем значение, только если оно принадлежит массиву
			dispatch({ type: 'SET', payload: nextValue as T[number] });
			return;
		}

		// Циклическое переключение
		dispatch({ type: 'TOGGLE' });
	};

	// Возвращаем текущее значение и функцию управления
	return [state.value as T[number] | boolean, toggle];
}
