# Промпты: дело 38 / ev-photo

Механика: seal_match.
Действие игрока: Совместить уцелевшие края двух лент.

## 1. assets/interactive/ev-photo-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два фрагмента серой промышленной фитильной ленты, один частично обгоревший, абстрактная сетка без маркировки. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-photo-fragments.json

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
