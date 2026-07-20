# Ассеты для дела 16. Белая полоса над полем

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-014-ev-satellite.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary agricultural satellite or high-altitude survey image of a large wheat field after a narrow hailstorm, a distinct pale damaged strip crossing otherwise healthy green-gold crops, realistic field boundaries and tractor lines, neutral evidence style, no labels, no text, no watermark.

## 2. assets/interactive/ev-satellite-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Пшеничное поле с узкой полосой свежего градового повреждения, один межевой столб с чёткой тенью, ровный горизонт. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-satellite-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
