# Ассеты для дела 35. Три силуэта в контейнере

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/denis-korin.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male motorcycle workshop owner and collector, 55 years old, clean casual work shirt, silver-streaked hair, polished self-confident expression, neutral document-photo background, original face, no robot or action-film styling, no logos, no text, no watermark.

## 2. evidence/case-037-ev-xray.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Cargo customs X-ray image of a sealed truck container showing three hollow chrome display mannequins standing upright and one motorcycle secured beside them, unmistakably objects rather than people, realistic monochrome security scan, no text, no logos, no watermark.

## 3. assets/interactive/ev-backup-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Контейнерная площадка: взрослый владелец со спины грузит мотоцикл и три нейтральных демонстрационных манекена, рядом один калибровочный столб с чёткой вечерней тенью; лицо не видно. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/ev-backup-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
