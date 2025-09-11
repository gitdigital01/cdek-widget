// Telegram WebApp + CDEK Widget v3 (Koyeb one-container)
class CdekWebApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.selectedPvz = null;
    this.widget = null;
    this.config = null;
    this.init();
  }

  async init() {
    if (this.tg) {
      this.tg.ready();
      this.tg.expand();
      this.setupTheme();
      this.tg.onEvent?.('backButtonClicked', () => this.tg.close());
    }
    this.bindEvents();

    try {
      this.config = await this.loadConfig();
      await this.initCdekWidget();
      this.handleTelegramInitData();
    } catch (e) {
      console.error('Ошибка при инициализации:', e);
      this.showErrorOnScreen('Не удалось инициализировать приложение. Проверьте конфигурацию.');
    }
  }

  setupTheme() {
    const tp = this.tg?.themeParams || {};
    document.body.style.setProperty('--tg-theme-bg-color', tp.bg_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-text-color', tp.text_color || '#000000');
    document.body.style.setProperty('--tg-theme-hint-color', tp.hint_color || '#6b7280');
    document.body.style.setProperty('--tg-theme-button-color', tp.button_color || '#2481cc');
    document.body.style.setProperty('--tg-theme-button-text-color', tp.button_text_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-secondary-bg-color', tp.secondary_bg_color || '#f8f9fa');
  }

  bindEvents() {
    document.getElementById('searchBtn')?.addEventListener('click', () => this.searchCity());
    document.getElementById('cityInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.searchCity(); });
    document.getElementById('confirmBtn')?.addEventListener('click', () => this.confirmSelection());
  }

  async loadConfig() {
    const res = await fetch('./config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`config.json HTTP ${res.status}`);
    return await res.json();
  }

  async initCdekWidget() {
    if (typeof window.CDEKWidget === 'undefined') throw new Error('CDEKWidget не загружен (проверьте CDN)');
    const from = this.config?.defaultFrom || 'Москва';
    const defaultLocation = this.config?.defaultLocation || 'Москва';

    const widgetConfig = {
      from,
      root: 'cdek-widget',
      apiKey: this.config.yandexMapsApiKey,
      servicePath: this.config.servicePath,
      defaultLocation,
      lang: 'rus',
      canChoose: true,
      hideDeliveryOptions: { door: false, office: false },
      goods: [],
      onReady: () => console.log('CDEK виджет готов'),
      onCalculate: (prices, addr) => console.log('Тарифы:', prices, 'Адрес/код города:', addr),
      onChoose: (mode, tariff, target) => {
        if (mode === 'office') {
          this.onPvzSelected(target);
          this.tg?.BackButton?.show?.();
        } else if (mode === 'door') {
          this.onAddressChosen(tariff, target);
          this.tg?.BackButton?.show?.();
        }
      },
    };

    try {
      this.widget = new window.CDEKWidget(widgetConfig);
    } catch (error) {
      console.error('Ошибка инициализации CDEK Widget:', error);
      this.showErrorOnScreen('Ошибка инициализации виджета СДЭК. Проверьте конфигурацию.');
      throw error;
    }
  }

  searchCity() {
    const input = document.getElementById('cityInput');
    const city = input?.value?.trim();
    if (!city) { this.showError('Введите название города или индекс'); return; }
    if (this.widget && this.widget.updateLocation) {
      this.widget.updateLocation(city);
      this.hideSelectedPvz();
    } else {
      this.showError('Виджет СДЭК не готов. Обновите страницу.');
    }
  }

  onPvzSelected(pvz) {
    this.selectedPvz = pvz;
    this.renderSelectedPvz(pvz);
  }

  onAddressChosen(tariff, target) {
    const selected = {
      type: 'door_selected',
      address: {
        formatted: target?.formatted,
        postal_code: target?.postal_code,
        city: target?.city,
        coordinates: target?.position,
      },
      tariff,
    };
    this.tg?.sendData?.(JSON.stringify(selected));
  }

  renderSelectedPvz(pvz) {
    const selectedDiv = document.getElementById('selectedPvz');
    const pvzInfo = document.getElementById('pvzInfo');
    pvzInfo.innerHTML = `
      <div class="pvz-name">${pvz.name || 'ПВЗ'}</div>
      <div class="pvz-address">📍 ${pvz.address || 'Адрес не указан'}</div>
      <div class="pvz-hours">🕒 ${pvz.work_time || 'Режим работы не указан'}</div>
      ${pvz.phone ? `<div class="pvz-phone">📞 ${pvz.phone}</div>` : ''}
    `;
    selectedDiv.style.display = 'block';
  }

  hideSelectedPvz() {
    const selectedDiv = document.getElementById('selectedPvz');
    selectedDiv.style.display = 'none';
  }

  confirmSelection() {
    if (!this.selectedPvz) { this.showError('ПВЗ не выбран'); return; }
    const data = {
      type: 'pvz_selected',
      pvz: {
        code: this.selectedPvz.code,
        name: this.selectedPvz.name,
        address: this.selectedPvz.address,
        city_code: this.selectedPvz.city_code,
        work_time: this.selectedPvz.work_time,
        phone: this.selectedPvz.phone,
        location: this.selectedPvz.location,
      },
    };
    this.tg?.sendData?.(JSON.stringify(data));
    this.tg?.close?.();
  }

  handleTelegramInitData() {
    const initUnsafe = this.tg?.initDataUnsafe;
    const startCity = initUnsafe?.start_param || (initUnsafe?.user?.language_code === 'ru' ? 'Москва' : 'Saint Petersburg');
    const cityField = document.getElementById('cityInput');
    if (cityField && startCity) {
      cityField.value = startCity;
      this.searchCity();
    }
  }

  showError(message) {
    try { this.tg?.showAlert?.(message); } catch { this.showErrorOnScreen(message); }
  }

  showErrorOnScreen(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed; top: 20px; left: 20px; right: 20px;
      background: #ff4444; color: white; padding: 15px; border-radius: 8px;
      z-index: 10000; font-size: 14px; text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => { new CdekWebApp(); });

window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Access to XMLHttpRequest')) {
    console.warn('CORS ошибка (ожидаемо, если сервис недоступен):', event.message);
    return;
  }
  console.error('Ошибка WebApp:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.name === 'CanceledError') {
    console.warn('Запрос отменен (нормально для виджета СДЭК):', event.reason.message);
    return;
  }
  console.error('Необработанная ошибка Promise:', event.reason);
});
