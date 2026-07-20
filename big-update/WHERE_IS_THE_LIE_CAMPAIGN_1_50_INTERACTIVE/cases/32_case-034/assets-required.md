# Требуемые интерактивные ассеты — дело 32

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/ev-serials-scene.webp | ev-serials | surface_reveal | 1600×1000 | WebP | нет | image_model | Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене. |
| assets/interactive/ev-serials-discarded_serial-trace-mask.svg | ev-serials | surface_reveal | 1600×1000 aligned to base image | SVG | да | frontend | Совместить с base image; порог обнаружения 50%; белая область маски — значимая зона. |

## Shared-зависимости

- shared/surface/soot.webp
- shared/surface/cloth-cursor.svg

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
