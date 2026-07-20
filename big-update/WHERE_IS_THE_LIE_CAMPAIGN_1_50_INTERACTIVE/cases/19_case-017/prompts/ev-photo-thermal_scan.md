# Промпты: дело 19 / ev-photo

Механика: thermal_scan.
Действие игрока: Включить тепловизор и найти источник 800-ваттной нагрузки.

## 1. assets/interactive/ev-photo-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

```text
Небольшая бытовая кухня после локального задымления, компактный прибор на столешнице, окно и следы лап без лиц. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-photo-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Размер: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать зоны после утверждения изображения.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```
