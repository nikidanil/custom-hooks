import { useCallback, useState } from 'react';
import { useWindowEvent } from './useWindowEvent';

/**
 * Тип, представляющий размеры области просмотра (вьюпорта) браузера.
 *
 * @example
 * { width: 1920, height: 1080 }
 *
 * @property {number} width - Ширина окна браузера в пикселях. Равна 0 при серверном рендеринге.
 * @property {number} height - Высота окна браузера в пикселях. Равна 0 при серверном рендеринге.
 */
export type ViewportSize = {
	width: number;
	height: number;
};

/**
 * Возвращает начальные размеры области просмотра.
 *
 * Функция безопасна при серверном рендеринге (SSR): при отсутствии `window` возвращает нулевые значения.
 * Используется как функция инициализации для `useState`, чтобы избежать чтения `window` при каждом рендере.
 *
 * @returns {ViewportSize} Объект с текущей шириной и высотой окна, или `{0, 0}` при SSR.
 */
const getInitialViewportSize = (): ViewportSize => ({
	width: typeof window !== 'undefined' ? window.innerWidth : 0,
	height: typeof window !== 'undefined' ? window.innerHeight : 0,
});

/**
 * Кастомный хук React для отслеживания текущих размеров области просмотра (вьюпорта).
 *
 * Хук корректно работает как в браузере, так и при серверном рендеринге (SSR-safe).
 * При монтировании на клиенте автоматически устанавливает актуальные размеры окна.
 * Подписывается на событие `resize` и обновляет состояние при изменении размеров.
 *
 * Использует `useWindowEvent` для безопасной подписки и отписки от события.
 *
 * @returns {ViewportSize} Объект с текущими значениями:
 * - `width` — ширина окна в пикселях.
 * - `height` — высота окна в пикселях.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { width, height } = useViewportSize();
 *
 *   return (
 *     <div>
 *       Текущий размер окна: {width} × {height}
 *     </div>
 *   );
 * };
 * ```
 *
 * @remarks
 * - На сервере возвращает `{ width: 0, height: 0 }`.
 * - На клиенте при первом рендере устанавливает реальные размеры окна.
 * - Обновления происходят при каждом событии `resize`. При необходимости можно добавить дебоунсинг.
 * - Не вызывает лишних ререндеров благодаря использованию `useState` с функцией инициализации.
 */
export const useViewportSize = (): ViewportSize => {
	// Инициализация состояния с помощью функции — безопасно при SSR и оптимально по производительности
	const [viewport, setViewport] = useState<ViewportSize>(() => getInitialViewportSize());

	// Обработчик изменения размеров окна
	// Мемоизирован, чтобы избежать лишних подписок в useWindowEvent
	const handleResize = useCallback(() => {
		setViewport({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}, []);

	// Подписка на событие 'resize' через универсальный хук
	// Отписка происходит автоматически при размонтировании
	useWindowEvent('resize', handleResize);

	return viewport;
};
