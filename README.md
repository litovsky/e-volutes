# E-VOLUTES · Planetary Dashboard

Мысленный эксперимент: Земля как космический корабль, а мы — его экипаж, проводящий аудит.

Цель — понять, какие профессии реально нужны, какие избыточны, а какие можно улучшить. Выделяем функции, обсуждаем, голосуем, делимся с людьми со всего мира.

## Структура проекта

```
e-volutes/
│
├── src/                        # Весь React-код
│   ├── main.jsx                # Точка входа, монтирует App
│   ├── App.jsx                 # Всё приложение: Earth, ModuleBlock, Lines, App
│   ├── App.css                 # Стили дашборда (HUD, карточки, анимации)
│   ├── index.css               # Глобальные стили (body, reset)
│   ├── lib/
│   │   └── supabase.js         # Supabase client (читает .env.local)
│   └── assets/                 # Статика (картинки, иконки)
│
├── supabase/                   # SQL для базы данных
│   ├── schema.sql              # Таблицы: blocks, functions, professions, votes, comments + RLS
│   └── seed.sql                # Начальные данные: 10 блоков цивилизации
│
├── public/                     # Файлы отдаются как есть (favicon и т.д.)
├── .env.local                  # Ключи Supabase (не в git!)
├── index.html                  # HTML-оболочка для Vite
├── vite.config.js              # Конфиг сборщика
└── package.json                # Зависимости и скрипты
```

## Запуск

```bash
npm install
npm run dev
```

Нужен файл `.env.local` с ключами Supabase:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Стек

- **React 19** + **Vite** — фронтенд
- **Supabase** — база данных, авторизация, realtime
