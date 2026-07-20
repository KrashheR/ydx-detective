# Промпты: дело 40 / ev-courier

Механика: seal_match.
Действие игрока: Совместить рваные края ярлыка.

## 1. assets/interactive/ev-courier-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Бумажный музейный контрольный ярлык с абстрактной рамкой и волокнистым рваным краем, без гербов и логотипов. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-courier-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Размер: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```
