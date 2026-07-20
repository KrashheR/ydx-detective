# Ассеты для дела 48. Огонь в «Компасе»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-050-photo-50.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary arson evidence photograph at the service door of a navigation-instrument restoration workshop: a charred fuse-like trail clearly runs from the outside yard across the threshold toward a burned archive cabinet, restrained fire damage, realistic old workshop materials, no dojo, no masks, no weapons, no logos, no text, no watermark.

## 2. evidence/case-050-camera-50.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night alley security camera frame behind a small restoration workshop: two adult arsonists from an unmarked gray van entering a service yard with a plain fuel can and tool case while an elderly craftsman leads a younger apprentice out the front in the distance, non-graphic, realistic CCTV, no logos, no text, no watermark.

## 3. assets/interactive/photo-50-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Обгоревший фрагмент промышленной фитильной ленты и чистый контрольный образец с абстрактной внутренней сеткой. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/photo-50-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
