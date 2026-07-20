# Ассеты для дела 28. Столкновение ради пломбы

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/dejan-markovich.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Balkan male driver, 44 years old, sturdy build, short dark hair with early gray, guarded practical expression, plain street jacket, neutral document-photo background, original face distinct from Dejan Kovac, no logos, no text, no watermark.

## 2. evidence/case-030-ev-sealcam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Roadside shop security camera frame during a minor traffic accident: while two drivers stand near the front vehicles, a third adult discreetly replaces a cargo seal on the rear door of a delivery van and carries a small hard container toward a car trunk, realistic distance and CCTV compression, no readable plates, no logos, no watermark.

## 3. assets/interactive/ev-sealcam-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две промышленно-защитные наклейки грузовой двери с абстрактной графикой, прозрачный фон, без бренда. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/ev-sealcam-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две промышленно-защитные наклейки грузовой двери с абстрактной графикой, прозрачный фон, без бренда. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.

## 5. assets/interactive/ev-sealcam-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
