# Ассеты для дела 44. Падение, которого не было

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/nika-rein-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: female academy trainee, 18 years old, simple athletic training jacket, guarded ambitious expression, neutral document-photo background, original face, age-appropriate appearance, no fantasy uniform, no franchise color scheme, no logos, no text, no watermark.

## 2. evidence/case-046-photo-46.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close forensic evidence photo of a cut safety-line inspection seal on a modern training tower lower platform, clean tool cut from the accessible side and a small patch of crude gray paint added afterward, realistic climbing safety equipment, no blood, no fall scene, no logos, no text, no watermark.

## 3. assets/interactive/photo-46-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две серые контрольные ленты: простая окрашенная бытовая и промышленная с внутренней сеткой, прозрачный фон. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/photo-46-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две серые контрольные ленты: простая окрашенная бытовая и промышленная с внутренней сеткой, прозрачный фон. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.

## 5. assets/interactive/photo-46-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
