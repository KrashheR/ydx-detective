# Промпты: дело 50 / ev-bottom

Механика: document_scan.
Действие игрока: Включить просвет и найти первую резолюцию под поздней наклейкой.

## 1. assets/interactive/ev-bottom-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Старый служебный формуляр страховой проверки с несколькими слоями бумаги, крупной зоной резолюции и архивной фактурой. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-bottom-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: После финального base.webp откалибровать hotspot и режим проявления.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```
