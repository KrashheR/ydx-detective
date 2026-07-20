# Требуемые интерактивные ассеты — дело 47

| Файл | Улика | Тип | Размер | Формат | Прозрачность | Источник | Постобработка |
|---|---|---|---|---|---|---|---|
| assets/interactive/photo-49-scene.webp | photo-49 | surface_reveal | 1600×1000 | WebP | нет | image_model | Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене. |
| assets/interactive/photo-49-front_drag_marks-trace-mask.svg | photo-49 | surface_reveal | 1600×1000 aligned to base image | SVG | да | frontend | Совместить с base image; порог обнаружения 52%; белая область маски — значимая зона. |
| assets/interactive/photo-49-undisturbed_vent-trace-mask.svg | photo-49 | surface_reveal | 1600×1000 aligned to base image | SVG | да | frontend | Совместить с base image; порог обнаружения 48%; белая область маски — значимая зона. |

## Shared-зависимости

- shared/surface/frost.webp
- shared/surface/cloth-cursor.svg

Файлы с generatedBy=frontend не нужно генерировать изображением: они создаются из JSON/SVG/Canvas после утверждения base/master ассета.
