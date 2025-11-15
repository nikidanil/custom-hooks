import { useCallback, useState } from 'react';

/**
 * Тип значения, которое может быть сохранено в localStorage.
 * Поддерживается только строковый формат, так как localStorage работает исключительно со строками.
 */
type LocalStorageSetValue = string;

/**
 * Тип возвращаемого значения при чтении данных из localStorage.
 * Может быть строкой (если значение найдено) или `null` (если ключ отсутствует).
 */
type LocalStorageReturnValue = LocalStorageSetValue | null;

/**
 * Сигнатура хука useLocalStorage.
 *
 * @param key - Ключ, по которому данные будут сохранены или извлечены из localStorage.
 * @returns Массив с двумя элементами:
 *          - `value`: текущее значение из localStorage (строка или null).
 *          - Объект с методами:
 *            - `setItem` — сохраняет значение по указанному ключу.
 *            - `removeItem` — удаляет запись из localStorage.
 */
type UseLocalStorage = (key: string) => [
	value: LocalStorageReturnValue,
	{
		/**
		 * Сохраняет значение в localStorage и обновляет состояние компонента.
		 * @param value - Строка, которую необходимо сохранить.
		 */
		setItem: (value: LocalStorageSetValue) => void;
		/**
		 * Удаляет значение из localStorage и устанавливает состояние в `null`.
		 */
		removeItem: () => void;
	}
];

/**
 * Вспомогательная функция для получения значения из localStorage по ключу.
 *
 * @param key - Ключ, по которому осуществляется чтение данных.
 * @returns Значение, связанное с ключом, или `null`, если ключ не найден.
 */
const getValueStorage = (key: string): LocalStorageReturnValue => {
	const saveValue: LocalStorageReturnValue = localStorage.getItem(key);
	return saveValue;
};

/**
 * Кастомный хук для работы с localStorage.
 *
 * Позволяет считывать, записывать и удалять данные из localStorage с автоматической
 * синхронизацией состояния React. Хук использует мемоизацию функций для предотвращения
 * их пересоздания при каждом рендере, что повышает производительность.
 *
 * @example
 * const [name, { setItem: setName, removeItem: removeName }] = useLocalStorage('userName');
 *
 * setName('Иван'); // Сохранит 'Иван' в localStorage
 * removeName();    // Удалит запись
 *
 * @param key - Уникальный ключ для хранения данных в localStorage.
 * @returns Массив, содержащий:
 *          - Текущее значение (из состояния), прочитанное при инициализации из localStorage.
 *          - Объект с методами `setItem` и `removeItem` для управления данными.
 */
export const useLocalStorage: UseLocalStorage = (key) => {
	// Инициализация состояния значением из localStorage
	const [value, setValue] = useState(() => getValueStorage(key));

	// Мемоизированная функция для сохранения значения
	const setItem = useCallback(
		(value: LocalStorageSetValue) => {
			localStorage.setItem(key, value);
			setValue(value);
		},
		[key] // Зависимость от ключа — функция обновляется при смене ключа
	);

	// Мемоизированная функция для удаления значения
	const removeItem = useCallback(() => {
		localStorage.removeItem(key);
		setValue(null);
	}, [key]); // Зависимость от ключа

	return [value, { setItem, removeItem }];
};
