import { useEffect, useRef, useState } from 'react';

/**
 * Пользовательский хук для отслеживания состояния наведения курсора на DOM-элемент.
 *
 * @template T - Тип HTML-элемента, к которому будет привязан ref. Должен быть потомком `HTMLElement`.
 *
 * @returns Объект с двумя полями:
 * - `hovered`: Булево значение, указывающее, находится ли курсор над элементом.
 * - `ref`: Ссылка (ref), которую необходимо привязать к DOM-элементу для отслеживания наведения.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { hovered, ref } = useHover<HTMLDivElement>();
 *
 *   return (
 *     <div ref={ref} style={{ background: hovered ? 'red' : 'blue' }}>
 *       {hovered ? 'Наведено' : 'Не наведено'}
 *     </div>
 *   );
 * };
 * ```
 *
 * @remarks
 * Хук использует события `mouseenter` и `mouseleave`, которые не всплывают из дочерних элементов,
 * что делает их более предсказуемыми для определения факта наведения.
 *
 * Обработчики событий добавляются только при монтировании компонента и корректно удаляются при размонтировании,
 * что предотвращает утечки памяти.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event | mouseenter на MDN}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseleave_event | mouseleave на MDN}
 */
export const useHover = <T extends HTMLElement>(): {
	hovered: boolean;
	ref: React.RefObject<T>;
} => {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<T>(null!);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const onMouseEnter = () => setHovered(true);
		const onMouseLeave = () => setHovered(false);

		node.addEventListener('mouseenter', onMouseEnter);
		node.addEventListener('mouseleave', onMouseLeave);

		return () => {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mouseleave', onMouseLeave);
		};
	}, []);

	return { hovered, ref };
};
