# Shared-ассеты surface_reveal

Эти файлы создаются один раз и переиспользуются всеми делами. Для текущих пяти дел обязательны `dirt.webp`, `soot.webp`, `frost.webp` и `cloth-cursor.svg`; остальные подготовлены для масштабирования механики.

| Файл | Назначение | Размер | Формат | Способ создания |
|---|---|---|---|---|
| shared/surface/dust.webp | Универсальная мягкая пыль | 1024×1024 seamless | WebP | frontend |
| shared/surface/dust-heavy.webp | Плотная старая пыль | 1024×1024 seamless | WebP | frontend |
| shared/surface/condensation.webp | Конденсат на стекле | 1024×1024 seamless | WebP | frontend |
| shared/surface/soot.webp | Копоть | 1024×1024 seamless | WebP | frontend |
| shared/surface/dirt.webp | Засохшая грязь | 1024×1024 seamless | WebP | frontend |
| shared/surface/frost.webp | Иней | 1024×1024 seamless | WebP | frontend |
| shared/surface/sand.webp | Мелкий песок | 1024×1024 seamless | WebP | frontend |
| shared/surface/powder-dark.webp | Тёмный проявляющий порошок | 1024×1024 seamless | WebP | frontend |
| shared/surface/powder-light.webp | Светлый проявляющий порошок | 1024×1024 seamless | WebP | frontend |
| shared/surface/brush-cursor.svg | Кисть для пыли и песка | 64×64 viewBox | SVG | frontend |
| shared/surface/cloth-cursor.svg | Салфетка для грязи, копоти, инея и конденсата | 64×64 viewBox | SVG | frontend |
| shared/surface/flashlight-cursor.svg | Источник бокового света для будущего light_reveal | 64×64 viewBox | SVG | frontend |

## Требования

- Текстуры бесшовные, с alpha-каналом и без смысловых следов.
- Следы, царапины, номера и отпечатки принадлежат reveal masks конкретного дела, а не shared texture.
- Текстуры предпочтительно создавать воспроизводимым Canvas-скриптом с seed и экспортировать в WebP.
- На low-end мобильном устройстве разрешается procedural Canvas без предварительного растра, если это быстрее по памяти.

## shared/surface/dust.webp

Многомасштабный Canvas noise тёплого серо-бежевого цвета, мягкие неоднородные alpha-пятна, бесшовный tile.

## shared/surface/dust-heavy.webp

Контрастный вариант dust с редкими крупными частицами, без заметного повторяющегося паттерна.

## shared/surface/condensation.webp

Полупрозрачный молочный слой с низкочастотным noise и редкими мягкими каплями, без готовых следов пальцев.

## shared/surface/soot.webp

Чёрно-серый alpha noise с мягкими краями и локальными неоднородностями, не перекрывающий сцену полностью.

## shared/surface/dirt.webp

Серо-коричневые полупрозрачные разводы и мелкая зернистость на alpha-канале, без направленных следов.

## shared/surface/frost.webp

Белый полупрозрачный fractal noise с мелкими кристаллическими краями, без запечённых царапин.

## shared/surface/sand.webp

Тёплая зернистая tile-текстура с мягкими вариациями плотности, без крупных камней.

## shared/surface/powder-dark.webp

Нейтральный тёмный мелкодисперсный noise для режима apply, прозрачный фон.

## shared/surface/powder-light.webp

Нейтральный светлый мелкодисперсный noise для тёмных поверхностей, прозрачный фон.

## shared/surface/brush-cursor.svg

Простой служебный курсор в бумажно-архивной стилистике, крупный читаемый силуэт, currentColor, без брендов и декоративной перегрузки.

## shared/surface/cloth-cursor.svg

Простой служебный курсор в бумажно-архивной стилистике, крупный читаемый силуэт, currentColor, без брендов и декоративной перегрузки.

## shared/surface/flashlight-cursor.svg

Простой служебный курсор в бумажно-архивной стилистике, крупный читаемый силуэт, currentColor, без брендов и декоративной перегрузки.
