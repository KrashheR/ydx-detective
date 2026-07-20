# Все промпты интерактивных ассетов

Критический текст, номера, даты и подписи всегда создаются программно поверх изображения.

## Дело 1: Тепловой осмотр телевизора

# Промпты: дело 1 / ev-scene

Механика: thermal_scan.
Действие игрока: Включить тепловизор и выбрать нагретый блок питания телевизора.

## 1. assets/interactive/ev-scene-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

```text
Телевизор в слегка подтопленной гостиной, сухой корпус, задняя панель хорошо читается, без видимого изображения на экране. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-scene-heat-zones.json

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


## Дело 3: Экспертиза сервисного акта

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


## Дело 6: Сопоставление пломб коробок

# Промпты: дело 6 / ev-delivery-receipt

Механика: seal_match.
Действие игрока: Повернуть фрагмент и совместить линию разрыва.

## 1. assets/interactive/ev-delivery-receipt-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Нейтральная бумажная контрольная лента для коробок с абстрактным серийным узором, без названия пиццерии. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-delivery-receipt-fragments.json

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


## Дело 7: Проверка времени фотографии следов

# Промпты: дело 7 / ev-tracks

Механика: shadow_time_check.
Действие игрока: Совместить эталонную тень заборного столба с тенью на снимке.

## 1. assets/interactive/ev-tracks-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

```text
Фермерский двор, непрерывные следы копыт, рассыпанные тюки, один вертикальный заборный столб и чёткая утренняя тень. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-tracks-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать angle/length по принятому изображению.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 9: Очистка повреждённой трубы

# Промпты: дело 9 / ev-pipe-photo

Механика: surface_reveal.
Действие игрока: Сотрите грязь с края вмятины и найдите след контакта.

## 1. assets/interactive/ev-pipe-photo-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Крупный план вдавленной металлической технической трубы в затопленной мастерской; на краю вмятины видны свежая дугообразная царапина и небольшой перенос синей краски, но без слоя грязи — покрытие будет процедурным. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-pipe-photo-blue_contact_arc-trace-mask.svg

- Назначение: Маска скрытого следа: Синяя краска и дугообразная царапина
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 54%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 10: Просветка формы 17-К

# Промпты: дело 10 / ev-17k-scan

Механика: document_scan.
Действие игрока: Включить просвет и найти прежний регистрационный индекс под белой корректировкой.

## 1. assets/interactive/ev-17k-scan-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Служебный страховой формуляр без читаемого текста, с крупным нижним колонтитулом и участком бумажной корректировки. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-17k-scan-scan-overlay.svg

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


## Дело 12: Экспертиза продлённого больничного

# Промпты: дело 12 / ev-sickleave

Механика: document_scan.
Действие игрока: Включить боковой свет и проверить строку с режимом труда.

## 1. assets/interactive/ev-sickleave-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Фиктивный медицинский бланк без реальных учреждений, крупная строка режима труда, важный текст только UI. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-sickleave-scan-overlay.svg

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


## Дело 16: Проверка времени полевого снимка

# Промпты: дело 16 / ev-satellite

Механика: shadow_time_check.
Действие игрока: Сопоставить тень межевого столба со временем прохождения грозы.

## 1. assets/interactive/ev-satellite-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

```text
Пшеничное поле с узкой полосой свежего градового повреждения, один межевой столб с чёткой тенью, ровный горизонт. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-satellite-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать angle/length по принятому изображению.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 17: Сопоставление защитной полосы корпуса

# Промпты: дело 17 / ev-hull

Механика: seal_match.
Действие игрока: Совместить фрагмент защитной полосы с контрольным образцом.

## 1. assets/interactive/ev-hull-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два образца защитной композитной полосы морского корпуса с вымышленным микропаттерном, следы воды и соли. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-hull-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два образца защитной композитной полосы морского корпуса с вымышленным микропаттерном, следы воды и соли. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.
```

## 3. assets/interactive/ev-hull-fragments.json

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


## Дело 18: Проявление линии затопления

# Промпты: дело 18 / ev-photos

Механика: surface_reveal.
Действие игрока: Сотрите засохшие грязевые разводы и найдите устойчивую линию воды.

## 1. assets/interactive/ev-photos-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Нижняя торцевая панель магазинного стеллажа и часть пола после откачки воды; чёткая физическая граница высоты затопления и мокрый низ, но без процедурной грязи и разводов поверх изображения. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-photos-waterline-trace-mask.svg

- Назначение: Маска скрытого следа: Граница высоты воды
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 52%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 19: Тепловой осмотр умной кухни

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


## Дело 20: Экспертиза уцелевшего листа

# Промпты: дело 20 / ev-fragment

Механика: document_scan.
Действие игрока: Включить боковой свет и найти следы стёртой карандашной резолюции.

## 1. assets/interactive/ev-fragment-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Старый лист страхового реестра с потёртой бумагой, пустой зоной резолюции и следами ластика; текст программный. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-fragment-scan-overlay.svg

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


## Дело 23: Очистка блока питания от копоти

# Промпты: дело 23 / ev-fire

Механика: surface_reveal.
Действие игрока: Сотрите копоть с панели блока питания и найдите место первичного пробоя.

## 1. assets/interactive/ev-fire-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Крупный документальный снимок металлического блока питания кофемашины после небольшого пожара; локальный кратер электрической дуги и оплавление изнутри наружу, без процедурного слоя копоти. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-fire-internal_arc-trace-mask.svg

- Назначение: Маска скрытого следа: Локальный след электрической дуги
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 58%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 24: Просветка акта аукционной передачи

# Промпты: дело 24 / ev-auction

Механика: document_scan.
Действие игрока: Переключиться на просвет и проверить дату под копировальным слоем.

## 1. assets/interactive/ev-auction-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Нейтральный акт приёма коллекционных часов, крупное поле даты и серийного номера, без логотипа аукциона. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-auction-scan-overlay.svg

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


## Дело 25: Проверка времени снимка стеллажей

# Промпты: дело 25 / ev-photo

Механика: shadow_time_check.
Действие игрока: Совместить тень стойки ворот с эталоном.

## 1. assets/interactive/ev-photo-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

```text
Склад семян после подтопления, мокрые нижние стеллажи, открытые ворота, одна вертикальная стойка и чёткая тень. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-photo-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать angle/length по принятому изображению.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 26: Сопоставление пломб вывезенных палет

# Промпты: дело 26 / ev-cam

Механика: seal_match.
Действие игрока: Совместить два фрагмента контрольной ленты.

## 1. assets/interactive/ev-cam-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Промышленная бумажно-полимерная пломба палеты с абстрактной сеткой и вымышленной нумерацией. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-cam-fragments.json

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


## Дело 27: Тепловой осмотр электрощита

# Промпты: дело 27 / ev-photo

Механика: thermal_scan.
Действие игрока: Включить тепловизор и проследить единственную перегретую фазу.

## 1. assets/interactive/ev-photo-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

```text
Открытый бытовой электрощит после аварии, целые автоматы и один визуально нейтральный вводный кабель, без цветной подсветки. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
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


## Дело 28: Сопоставление пломб грузового отсека

# Промпты: дело 28 / ev-sealcam

Механика: seal_match.
Действие игрока: Сопоставить края и защитный узор двух пломб.

## 1. assets/interactive/ev-sealcam-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две промышленно-защитные наклейки грузовой двери с абстрактной графикой, прозрачный фон, без бренда. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-sealcam-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две промышленно-защитные наклейки грузовой двери с абстрактной графикой, прозрачный фон, без бренда. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.
```

## 3. assets/interactive/ev-sealcam-fragments.json

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


## Дело 30: Экспертиза заявления об угоне

# Промпты: дело 30 / ev-police

Механика: document_scan.
Действие игрока: Включить боковой свет и проверить участок перечня ключей.

## 1. assets/interactive/ev-police-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Фиктивный полицейский бланк без гербов и реальных ведомств, крупный список ключей, фактура стёртой карандашной строки. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-police-scan-overlay.svg

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


## Дело 31: Сопоставление пломбы защитного реле

# Промпты: дело 31 / ev-relay

Механика: seal_match.
Действие игрока: Совместить края и микроперфорацию пломб.

## 1. assets/interactive/ev-relay-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Миниатюрные гарантийные наклейки промышленного реле с абстрактной микроперфорацией, без реальных сертификационных знаков. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-relay-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Миниатюрные гарантийные наклейки промышленного реле с абстрактной микроперфорацией, без реальных сертификационных знаков. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.
```

## 3. assets/interactive/ev-relay-fragments.json

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


## Дело 32: Очистка серийного номера от сажи

# Промпты: дело 32 / ev-serials

Механика: surface_reveal.
Действие игрока: Сотрите сажу с таблички шасси и откройте сохранившийся номер.

## 1. assets/interactive/ev-serials-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Крупный план обгоревшего металлического шасси бытовой электроники с пустой заводской табличкой и старым износом; серийный номер будет UI-слоем, сажа будет процедурной. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-serials-discarded_serial-trace-mask.svg

- Назначение: Маска скрытого следа: Номер списанного корпуса
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 50%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 34: Тепловая карта зарядного контура

# Промпты: дело 34 / ev-melt

Механика: thermal_scan.
Действие игрока: Включить тепловизор и выбрать непрерывный тепловой путь от кабеля к порту.

## 1. assets/interactive/ev-melt-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

```text
Экспериментальный электромобиль на утилитарной зарядной площадке после грозы, зарядный кабель и порт полностью видны. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-melt-heat-zones.json

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


## Дело 35: Проверка времени резервной записи

# Промпты: дело 35 / ev-backup

Механика: shadow_time_check.
Действие игрока: Сопоставить тень столба с временной шкалой.

## 1. assets/interactive/ev-backup-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

```text
Контейнерная площадка: взрослый владелец со спины грузит мотоцикл и три нейтральных демонстрационных манекена, рядом один калибровочный столб с чёткой вечерней тенью; лицо не видно. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-backup-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать angle/length по принятому изображению.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 36: Просветка этикетки реагента

# Промпты: дело 36 / ev-analysis

Механика: document_scan.
Действие игрока: Включить просвет и выбрать скрытую заводскую маркировку.

## 1. assets/interactive/ev-analysis-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Нейтральная этикетка химической тары с крупными пустыми полями кода и партии; без знаков реальных производителей. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-analysis-scan-overlay.svg

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


## Дело 38: Сопоставление фитильной ленты

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


## Дело 39: Экспертиза грузовой ведомости

# Промпты: дело 39 / ev-manifest

Механика: document_scan.
Действие игрока: Включить УФ-режим и проверить поле фактической массы.

## 1. assets/interactive/ev-manifest-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Фиктивная грузовая ведомость экспериментального самолёта, крупные поля массы и маршрута, лёгкие следы копоти. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/ev-manifest-scan-overlay.svg

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


## Дело 40: Сопоставление контрольного ярлыка футляра

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


## Дело 41: Экспертиза экзаменационного протокола

# Промпты: дело 41 / protocol

Механика: document_scan.
Действие игрока: Включить боковой свет и найти прежние оценки под исправлениями.

## 1. assets/interactive/protocol-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Фиктивный учебный протокол академии без логотипа, таблица оценок с крупной зоной исправлений, текст программный. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/protocol-scan-overlay.svg

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


## Дело 42: Тепловой осмотр теплицы

# Промпты: дело 42 / photo-44

Механика: thermal_scan.
Действие игрока: Включить тепловизор и выбрать источник остаточного тепла.

## 1. assets/interactive/photo-44-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

```text
Теплица после небольшого локального пожара, металлическая чаша на рабочем столе, грядки и климатический блок хорошо видны. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/photo-44-heat-zones.json

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


## Дело 44: Сопоставление пломбы страховочной линии

# Промпты: дело 44 / photo-46

Механика: seal_match.
Действие игрока: Совместить края и защитный рисунок.

## 1. assets/interactive/photo-46-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две серые контрольные ленты: простая окрашенная бытовая и промышленная с внутренней сеткой, прозрачный фон. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/photo-46-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две серые контрольные ленты: простая окрашенная бытовая и промышленная с внутренней сеткой, прозрачный фон. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.
```

## 3. assets/interactive/photo-46-fragments.json

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


## Дело 46: Экспертиза счёта на оборудование

# Промпты: дело 46 / document-48

Механика: document_scan.
Действие игрока: Включить УФ-режим и проверить серийный номер и имя покупателя.

## 1. assets/interactive/document-48-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Размер: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

```text
Create a realistic fictional administrative document for an insurance detective game. Фиктивный счёт на промышленный тепловой шкаф, крупные поля покупателя и серийного номера, без брендов. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.
```

## 2. assets/interactive/document-48-scan-overlay.svg

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


## Дело 47: Очистка инея в морозильном сейфе

# Промпты: дело 47 / photo-49

Механика: surface_reveal.
Действие игрока: Счистите иней с полки и области у вентиляционной решётки.

## 1. assets/interactive/photo-49-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Почти фронтальный вид внутренней металлической полки лабораторного морозильного сейфа и задней вентиляционной решётки; свежие параллельные полосы волочения направлены к переднему краю, краска и металл вокруг вентиляции целы без царапин; без слоя инея, который будет процедурным. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/photo-49-front_drag_marks-trace-mask.svg

- Назначение: Маска скрытого следа: Полосы к передней дверце
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 52%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## 3. assets/interactive/photo-49-undisturbed_vent-trace-mask.svg

- Назначение: Маска скрытого следа: Неповреждённый металл у вентиляции
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 48%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 48: Сопоставление обгоревшего фитиля

# Промпты: дело 48 / photo-50

Механика: seal_match.
Действие игрока: Совместить уцелевшие участки разрыва и внутренней сетки.

## 1. assets/interactive/photo-50-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Обгоревший фрагмент промышленной фитильной ленты и чистый контрольный образец с абстрактной внутренней сеткой. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/photo-50-fragments.json

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


## Дело 49: Проверка времени фотографии фургона

# Промпты: дело 49 / photo-staged-van

Механика: shadow_time_check.
Действие игрока: Совместить тень сигнального столба с временной шкалой.

## 1. assets/interactive/photo-staged-van-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

```text
Грузовой фургон у нейтральной тоннельной рампы, один сигнальный столб с чёткой дневной тенью, без людей и логотипов. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/photo-staged-van-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать angle/length по принятому изображению.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```


## Дело 50: Просветка оригинала формы 17-К

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


## Дело 50: Сопоставление транспортной пломбы чемодана

# Промпты: дело 50 / ev-suitcase-seal

Механика: seal_match.
Действие игрока: Совместить фрагменты серой транспортной пломбы.

## 1. assets/interactive/ev-suitcase-seal-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Размер: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

```text
Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Серая транспортная пломба багажа с оригинальной абстрактной сеткой, без символов авиакомпаний и реальных кодов. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.
```

## 2. assets/interactive/ev-suitcase-seal-fragments.json

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

