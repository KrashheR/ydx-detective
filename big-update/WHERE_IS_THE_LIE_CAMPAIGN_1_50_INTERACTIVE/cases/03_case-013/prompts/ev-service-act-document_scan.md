# Промпты: дело 3 / ev-service-act

Механика: document_scan.
Действие игрока: Включить УФ-режим, найти исправленные цифры и сравнить их с IMEI полиса.

## 1. assets/interactive/ev-service-act-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Фиктивный акт ремонта смартфона с крупным полем IMEI, датой и зоной подписи; весь важный текст накладывается UI. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-service-act-scan-overlay.svg

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
