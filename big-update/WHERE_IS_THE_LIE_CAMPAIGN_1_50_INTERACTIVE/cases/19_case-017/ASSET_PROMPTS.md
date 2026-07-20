# Ассеты для дела 19. Ботинок на 800 ватт

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-017-ev-yardcam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night home security camera frame through a kitchen window: a raccoon dragging a single leather boot onto a counter beside an open microwave, realistic domestic kitchen, slightly grainy low-light CCTV, no fire yet, no logos, no text, no watermark, natural animal proportions.

## 2. assets/interactive/ev-photo-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Небольшая бытовая кухня после локального задымления, компактный прибор на столешнице, окно и следы лап без лиц. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-photo-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
