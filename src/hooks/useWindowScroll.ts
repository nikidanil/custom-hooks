import { useCallback, useState } from 'react';
import { useWindowEvent } from './useWindowEvent';

/**
 * Тип, представляющий текущую позицию прокрутки окна браузера.
 *
 * @property {number} x - Горизонтальная координата прокрутки (аналог `window.scrollX`).
 * @property {number} y - Вертикальная координата прокрутки (аналог `window.scrollY`).
 *
 * @example
 * { x: 0, y: 350 }
 */
type WindowScroll = {
	x: number;
	y: number;
};

/**
 * Параметры для программного управления прокруткой окна.
 *
 * Поддерживает частичное указание координат, а также поведение прокрутки.
 *
 * @property {number} [x] - Горизонтальная позиция прокрутки. Необязательная.
 * @property {number} [y] - Вертикальная позиция прокрутки. Необязательная.
 * @property {ScrollBehavior} [behavior='smooth'] - Поведение прокрутки: плавная или мгновенная.
 *
 * @example
 * { y: 500, behavior: 'smooth' }
 * @example
 * { x: 100, y: 200 }
 */
type ScrollOptions = Partial<WindowScroll> & {
	behavior?: ScrollBehavior;
};

/**
 * Возвращает начальное состояние прокрутки окна.
 *
 * Функция безопасна при серверном рендеринге (SSR): если `window` недоступен, возвращает нулевые значения.
 * Используется как инициализатор для `useState`, чтобы избежать чтения `window` при каждом рендере.
 *
 * @returns {WindowScroll} Объект с текущими координатами прокрутки или `{ x: 0, y: 0 }` при SSR.
 */
const getInitialWindowScroll = (): WindowScroll => ({
	x: typeof window !== 'undefined' ? window.scrollX : 0,
	y: typeof window !== 'undefined' ? window.scrollY : 0,
});

/**
 * Кастомный хук React для отслеживания и управления прокруткой окна браузера.
 *
 * Хук предоставляет:
 * - Текущее положение прокрутки (`scroll.x`, `scroll.y`).
 * - Функцию `scrollTo` для программного перемещения к заданной позиции.
 *
 * Подписка на событие `scroll` реализована через `useWindowEvent`, что обеспечивает
 * корректную отписку при размонтировании компонента и совместимость с SSR.
 *
 * Состояние обновляется как при пользовательском скролле, так и при вызове `scrollTo`.
 *
 * @returns {Object} Объект с двумя полями:
 * - `scroll`: { x: number, y: number } — текущие координаты прокрутки.
 * - `scrollTo`: Функция для плавного или мгновенного скроллинга к указанной позиции.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { scroll, scrollTo } = useWindowScroll();
 *
 *   const handleTopClick = () => {
 *     scrollTo({ y: 0, behavior: 'smooth' });
 *   };
 *
 *   return (
 *     <div>
 *       <p>Прокручено: {scroll.y}px по вертикали</p>
 *       <button onClick={handleTopClick}>Наверх</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * // Горизонтальная прокрутка
 * scrollTo({ x: 200, behavior: 'auto' });
 *
 * @remarks
 * - На сервере начальное состояние — `{ x: 0, y: 0 }`.
 * - На клиенте состояние инициализируется актуальными значениями `window.scrollX/Y`.
 * - Хук полностью безопасен при использовании в SSR-фреймворках (Next.js, Gatsby и др.).
 * - Использование `setScroll` при вызове `scrollTo` гарантирует согласованность состояния
 *   без ожидания события `scroll`.
 */
export const useWindowScroll = () => {
	// Текущее состояние прокрутки
	const [scroll, setScroll] = useState<WindowScroll>(() => getInitialWindowScroll());

	// Обработчик нативного скролла — обновляет состояние при прокрутке мышью, колесом и т.д.
	const handleScroll = useCallback(() => {
		setScroll({
			x: window.scrollX,
			y: window.scrollY,
		});
	}, []);

	// Подписка на событие 'scroll' с автоматической отпиской
	useWindowEvent('scroll', handleScroll);

	// Функция для программного управления прокруткой
	const scrollTo = useCallback((options: ScrollOptions) => {
		const { x = 0, y = 0, behavior = 'smooth' } = options;

		// Вызов нативного метода прокрутки
		window.scrollTo({
			left: x,
			top: y,
			behavior,
		});

		// Синхронное обновление состояния для согласованности
		setScroll((prev) => ({
			...prev,
			x,
			y,
		}));
	}, []);

	return { scroll, scrollTo };
};
