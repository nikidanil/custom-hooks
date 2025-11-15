import { useEffect } from 'react';

/**
 * Тип, представляющий допустимые имена событий для объекта `window`.
 *
 * Использует встроенный в TypeScript `WindowEventMap` для сопоставления
 * имени события с соответствующим типом события.
 *
 * @example
 * 'resize' → UIEvent
 * 'click' → MouseEvent
 * 'keydown' → KeyboardEvent
 */
type WindowEventName = keyof WindowEventMap;

/**
 * Кастомный хук React для безопасной подписки на события объекта `window`.
 *
 * Подписывается на указанное событие при монтировании компонента и
 * автоматически отписывается при размонтировании с использованием `AbortController`.
 *
 * Поддерживает полную типизацию события и все стандартные опции `addEventListener`,
 * кроме `signal`, который управляется внутри хука.
 *
 * @template K - Тип, расширяющий допустимые имена событий `WindowEventName`.
 *
 * @param {K} eventName - Имя события, на которое необходимо подписаться.
 *                        Должно быть одним из ключей `WindowEventMap`.
 *
 * @param {(event: WindowEventMap[K]) => void} handler - Функция-обработчик события.
 *                                                      Принимает параметр события с типом,
 *                                                      соответствующим имени события.
 *                                                      Должна быть мемоизирована (через `useCallback`)
 *                                                      для предотвращения лишних подписок.
 *
 * @param {Omit<AddEventListenerOptions, 'signal'>} [options] - Дополнительные опции для слушателя событий.
 *                                                            Параметр `signal` запрещён, так как
 *                                                            управляется внутри хука через `AbortController`.
 *
 * @returns {void} Хук не возвращает значения.
 *
 * @example
 * ```tsx
 * const handleScroll = useCallback((event: Event) => {
 *   console.log('Прокрутка:', window.scrollY);
 * }, []);
 *
 * useWindowEvent('scroll', handleScroll, { passive: true });
 * ```
 *
 * @example
 * ```tsx
 * const handleClick = useCallback((event: MouseEvent) => {
 *   if (event.target === modalRef.current) {
 *     closeModal();
 *   }
 * }, [closeModal]);
 *
 * useWindowEvent('click', handleClick, { capture: true });
 * ```
 *
 * @remarks
 * Хук безопасен при использовании с SSR (проверяет наличие `window`).
 * Рекомендуется передавать `handler`, обёрнутый в `useCallback`, чтобы избежать
 * избыточных подписок при каждом рендере.
 * Изменение `options` приводит к повторной подписке.
 */
export const useWindowEvent = <K extends WindowEventName>(
	eventName: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: Omit<AddEventListenerOptions, 'signal'>
): void => {
	useEffect(() => {
		if (typeof window === 'undefined' || !handler) return;

		const controller = new AbortController();
		const eventListenerOptions: AddEventListenerOptions = {
			signal: controller.signal,
			...options,
		};

		window.addEventListener(eventName, handler, eventListenerOptions);

		return () => {
			controller.abort();
		};
	}, [eventName, handler, options]);
};
