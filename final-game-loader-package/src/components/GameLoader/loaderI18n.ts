import type { LoaderCopy, LoaderLocale } from './types';

export const LOADER_COPY: Record<LoaderLocale, LoaderCopy> = {
  ru: {
    title: 'Где ложь?',
    subtitle: 'Симулятор детектива',
    stamp: 'Дело загружается',
    phases: {
      sdk: 'Связываемся с архивом…',
      save: 'Восстанавливаем материалы дела…',
      content: 'Изучаем документы…',
      ready: 'Дело готово',
    },
    tip: 'Отказ в выплате требует доказательств. Найди и отметь противоречие.',
  },
  en: {
    title: 'Where Is the Lie?',
    subtitle: 'Detective Simulator',
    stamp: 'Loading case',
    phases: {
      sdk: 'Contacting the archive…',
      save: 'Restoring case materials…',
      content: 'Examining documents…',
      ready: 'Case ready',
    },
    tip: 'A rejected claim needs proof. Find and mark a contradiction.',
  },
  tr: {
    title: 'Yalan Nerede?',
    subtitle: 'Dedektif Simülatörü',
    stamp: 'Dosya yükleniyor',
    phases: {
      sdk: 'Arşive bağlanılıyor…',
      save: 'Dosya belgeleri geri yükleniyor…',
      content: 'Belgeler inceleniyor…',
      ready: 'Dosya hazır',
    },
    tip: 'Ödemeyi reddetmek için kanıt gerekir. Çelişkiyi bul ve işaretle.',
  },
  ar: {
    title: 'أين الكذبة؟',
    subtitle: 'محاكي المحقق',
    stamp: 'جارٍ تحميل القضية',
    phases: {
      sdk: 'جارٍ الاتصال بالأرشيف…',
      save: 'جارٍ استعادة مستندات القضية…',
      content: 'جارٍ فحص المستندات…',
      ready: 'القضية جاهزة',
    },
    tip: 'رفض التعويض يحتاج إلى دليل. اعثر على التناقض وحدده.',
  },
  kk: {
    title: 'Өтірік қайда?',
    subtitle: 'Детектив симуляторы',
    stamp: 'Іс жүктелуде',
    phases: {
      sdk: 'Мұрағатпен байланыс орнатылуда…',
      save: 'Іс материалдары қалпына келтірілуде…',
      content: 'Құжаттар зерттелуде…',
      ready: 'Іс дайын',
    },
    tip: 'Төлемнен бас тарту үшін дәлел керек. Қайшылықты тауып, белгіле.',
  },
};
