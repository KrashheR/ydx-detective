# Ассеты для дела 25. Семена после ливня

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-027-ev-photo.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Realistic insurance evidence photo inside a flooded agricultural storage unit: lower seed sacks visibly wet up to a consistent 30 centimeter waterline, upper shelves and bags dry, muddy floor and drainage water, restrained natural lighting, no readable brands, no text, no watermark.

## 2. assets/interactive/ev-photo-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Склад семян после подтопления, мокрые нижние стеллажи, открытые ворота, одна вертикальная стойка и чёткая тень. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-photo-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
