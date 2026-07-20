# Ассеты для дела 1. Телевизор, переживший потоп

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-scene-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Телевизор в слегка подтопленной гостиной, сухой корпус, задняя панель хорошо читается, без видимого изображения на экране. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 2. assets/interactive/ev-scene-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
