# Ассеты для дела 34. Невозможная скорость

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/maxim-yartsev.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male experimental vehicle engineer, 41 years old, understated technical jacket, attentive analytical expression, short hair, neutral document-photo background, original face, no famous likeness, no futuristic costume, no logos, no text, no watermark.

## 2. evidence/case-036-ev-camera.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night security camera frame at an outdoor electric vehicle charging bay during a lightning-related grid surge: an experimental but believable electric coupe remains parked, bright electrical arc at the charging connector and first smoke visible, wet pavement, no motion blur, no brands, no text, no watermark.

## 3. assets/interactive/ev-melt-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Экспериментальный электромобиль на утилитарной зарядной площадке после грозы, зарядный кабель и порт полностью видны. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/ev-melt-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
