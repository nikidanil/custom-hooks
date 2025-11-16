# 🛠️ Коллекция пользовательских React-хуков

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

**Репозиторий для глубокого погружения в создание типобезопасных, переиспользуемых пользовательских хуков в React.**

## 🎯 Цель проекта

Этот репозиторий был создан как практическая лаборатория для отработки концепций продвинутой разработки на React. Мы фокусируемся не на создании очередного UI-фреймворка, а на **качестве кода, типобезопасности и архитектуре**.

Основные цели:
*   **Понять на практике** жизненный цикл React-компонентов и хуков.
*   **Научиться инкапсулировать** сложную логику (запросы к API, работа с DOM/BOM, side effects) в простые для использования хуки.
*   **Мастерски применять TypeScript** для создания безупречно типобезопасных решений, включая перегрузки функций, дженерики и продвинутые типы.
*   **Реализовать best practices:** отмена запросов, предотвращение утечек памяти, мемоизация, SSR-безопасность.

## 💡 Решаемые задачи / Проблемы

В реальной разработке на React мы часто сталкиваемся с повторяющейся логикой:
*   "Как типизировать `fetch` и избежать `any`?"
*   "Как отслеживать состояние наведения на элемент?"
*   "Как синхронизировать состояние с `localStorage`?"
*   "Как реагировать на изменение размеров окна или прокрутку?"
*   "Как создать переключатель между двумя и более состояниями?"

Этот репозиторий даёт готовые, протестированные и надёжные ответы на эти вопросы, решая проблемы **переиспользуемости, типобезопасности и производительности**.

## 🚀 Запуск и использование

Для тестирования любого хука из этого репозитория:

1.  **Клонируйте репозиторий и перейдите в нужную ветку:**
    ```bash
    git clone <repo-url>
    cd <repo-name>
    # Пример для хука useFetch
    git checkout feature/use-fetch
    ```

2.  **Установите зависимости:**
    ```bash
    npm install
    ```

3.  **Запустите dev-сервер Vite:**
    ```bash
    npm run dev
    ```

4.  **Откройте браузер** по адресу, который указан в терминале (обычно `http://localhost:5173`).
5.  Взаимодействуйте с интерфейсом, чтобы увидеть хук в действии. Исходный код тестового компонента `App` находится в `src/App.tsx`.

## 🌿 Структура репозитория

Реализация каждого хука находится в своей изолированной ветке, что позволяет изучать их по отдельности.

| Ветка | Хук | Назначение |
| :--- | :--- | :--- |
| [`main`](/) | (Общий обзор) | Эта ветка с общим README |
| [`feature/use-fetch`](https://github.com/nikidanil/custom-hooks/tree/feature/use-fetch) | `useFetch` | Умная обёртка для HTTP-запросов |
| [`feature/use-hover`](https://github.com/nikidanil/custom-hooks/tree/feature/use-hover) | `useHover` | Отслеживание наведения курсора на элемент |
| [`feature/use-local-storage`](https://github.com/nikidanil/custom-hooks/tree/feature/use-locale-storage) | `useLocalStorage` | Синхронизация состояния с localStorage |
| [`feature/use-toggle`](https://github.com/nikidanil/custom-hooks/tree/feature/use-toggle) | `useToggle` | Переключение между булевыми или произвольными значениями |
| [`feature/use-viewport-size`](https://github.com/nikidanil/custom-hooks/tree/feature/use-viewport-size) | `useViewportSize` | Отслеживание размеров окна браузера |
| [`feature/use-window-scroll`](https://github.com/nikidanil/custom-hooks/tree/feature/use-window-scroll) | `useWindowScroll` | Отслеживание и управление прокруткой страницы |

## 📌 Важные детали

*   **Технологический стек:** React, TypeScript, Vite.
*   **Качество кода:** Все хуки полностью типобезопасны, снабжены JSDoc-комментариями, обрабатывают edge-кейсы (отмена запросов, SSR, циклические ссылки при сериализации).
*   **Архитектура:** Хуки независимы и могут быть легко скопированы в любой проект.
*   **Вспомогательный хук:** [`useWindowEvent`](https://github.com/nikidanil/custom-hooks/tree/feature/use-viewport-size/src/hooks/useWindowEvent.ts) — используется внутри `useViewportSize` и `useWindowScroll` для безопасной работы с событиями `window`.

---

**Начните изучение с перехода в одну из feature-веток!**
