const EVENT_PARAMETERS = {
  page_view: ['page_path'],
  vehicle_detail_view: ['page_path'],
  contact_click: ['method'],
  finance_cta_click: ['source'],
  finance_start: ['source'],
  finance_success: ['source'],
};

const ALLOWED_VALUES = {
  method: new Set(['phone', 'email']),
  source: new Set(['home', 'vehicle_detail', 'finance_form', 'navigation']),
};

export function isPublicAnalyticsPath(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return false;
  const path = pathname.split(/[?#]/, 1)[0];
  return path !== '/admin' && !path.startsWith('/admin/')
    && path !== '/api' && !path.startsWith('/api/');
}

export function createPublicAnalyticsEvent(eventName, parameters = {}) {
  const allowedParameters = EVENT_PARAMETERS[eventName];
  if (!allowedParameters) return null;

  const event = { event: eventName };
  for (const key of allowedParameters) {
    const value = parameters[key];
    if (key === 'page_path') {
      if (typeof value === 'string') {
        const path = value.split(/[?#]/, 1)[0];
        if (isPublicAnalyticsPath(path)) event.page_path = path;
      }
    } else if (typeof value === 'string' && ALLOWED_VALUES[key]?.has(value)) {
      event[key] = value;
    }
  }

  if (allowedParameters.includes('page_path') && !event.page_path) return null;
  return event;
}

export function trackPublicAnalyticsEvent(eventName, parameters = {}, pathname) {
  const currentPath = pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);
  if (!isPublicAnalyticsPath(currentPath)) return false;

  const event = createPublicAnalyticsEvent(eventName, parameters);
  if (!event || typeof window === 'undefined') return false;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
  return true;
}