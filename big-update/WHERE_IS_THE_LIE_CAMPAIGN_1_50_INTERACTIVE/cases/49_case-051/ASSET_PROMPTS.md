# Ассеты для дела 49. Последний фургон

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/roman-dray-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male small logistics operator, 33 years old, casual work jacket, alert opportunistic expression, neutral document-photo background, original face, no street-gang or comic styling, no masks, no logos, no text, no watermark.

## 2. evidence/case-051-photo-51.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Rear cargo bay of a delivery van after an alleged hijacking: cargo straps are neatly folded, mounts intact, no signs of struggle or emergency displacement, empty organized fixtures, realistic documentary insurance evidence photograph, no blood, no logos, no readable text, no watermark.

## 3. evidence/case-051-camera-51.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Airport cargo ramp security camera frame showing a young male van owner calmly handing documents to a guard while workers unload boxed street sensors, routine cooperative scene, no weapons or struggle, realistic industrial lighting, no readable badges or signs, no logos, no watermark.

## 4. assets/interactive/photo-staged-van-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Грузовой фургон у нейтральной тоннельной рампы, один сигнальный столб с чёткой дневной тенью, без людей и логотипов. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 5. assets/interactive/photo-staged-van-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
