import { useEffect, useState } from 'react';

/**
 * Тип, представляющий размеры области просмотра (вьюпорта).
 *
 * @property {number} width - Ширина окна браузера в пикселях.
 * @property {number} height - Высота окна браузера в пикселях.
 */
export type ViewportSize = {
	width: number;
	height: number;
};

/**
 * Кастомный хук React, который отслеживает текущие размеры области просмотра (вьюпорта).
 *
 * Хук возвращает объект с текущими значениями ширины и высоты окна браузера
 * и автоматически обновляет их при изменении размеров окна (событие `resize`).
 *
 * Внутренне используется `AbortController` для корректной отписки от события,
 * что предотвращает утечки памяти и обновления состояния на размонтированных компонентах.
 *
 * @returns {ViewportSize} Объект с текущими шириной и высотой области просмотра.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { width, height } = useViewportSize();
 *
 *   return (
 *     <div>
 *       Текущий размер окна: {width} x {height}
 *     </div>
 *   );
 * };
 * ```
 */
export const useViewportSize = (): ViewportSize => {
	const [viewport, setViewport] = useState<ViewportSize>({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		/**
		 * Обработчик изменения размеров окна.
		 * Обновляет состояние хука новыми значениями ширины и высоты.
		 */
		const handleResize = () => {
			setViewport({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		const controller = new AbortController();
		window.addEventListener('resize', handleResize, { signal: controller.signal });

		// Очистка: отписка от события при размонтировании
		return () => {
			controller.abort();
		};
	}, []);

	return viewport;
};
