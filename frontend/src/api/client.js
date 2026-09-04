/**
 * Central PUSHPAK API Client
 * Interfaces with the FastAPI Government Backend (Milestones M0A through M4).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.detail || errJson.message)) {
          errorMsg = errJson.detail || errJson.message;
        }
      } catch {
        // Ignore json parse error on non-json payload
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error on [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. System Health
  getHealth: () => request('/health'),
  getApiV1Health: () => request('/api/v1/health'),

  // 2. Airfare Price Index Suite (M4)
  getHeadlineIndex: (weightingMethod = 'observed_records') =>
    request(`/api/v1/index/headline?weighting_method=${encodeURIComponent(weightingMethod)}`),
  
  getCoreIndex: (weightingMethod = 'observed_records') =>
    request(`/api/v1/index/core?weighting_method=${encodeURIComponent(weightingMethod)}`),
  
  getIndexSummary: (weightingMethod = 'observed_records') =>
    request(`/api/v1/index/summary?weighting_method=${encodeURIComponent(weightingMethod)}`),
  
  getIndexMethodology: () =>
    request('/api/v1/index/methodology'),

  // 3. Airfare Intelligence & Booking Windows (M2)
  getRouteIntelligence: (routeCode) =>
    request(`/api/v1/intelligence/routes/${encodeURIComponent(routeCode)}`),
  
  getBookingWindows: (routeCode = null) =>
    request(routeCode ? `/api/v1/intelligence/booking-windows?route_code=${encodeURIComponent(routeCode)}` : '/api/v1/intelligence/booking-windows'),
  
  getAirlineComparison: (routeCode = null) =>
    request(routeCode ? `/api/v1/intelligence/compare-airlines?route_code=${encodeURIComponent(routeCode)}` : '/api/v1/intelligence/compare-airlines'),
  
  getFareIndexSummary: () =>
    request('/api/v1/intelligence/fare-index'),

  // 4. Policy Intelligence & Decision Support (M3)
  getRoutePolicy: (routeCode) =>
    request(`/api/v1/policy/routes/${encodeURIComponent(routeCode)}`),
  
  getNetworkPolicy: () =>
    request('/api/v1/policy/network'),
  
  getPolicyFlags: (severity = null, routeCode = null) => {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (routeCode) params.append('route_code', routeCode);
    const query = params.toString();
    return request(query ? `/api/v1/policy/flags?${query}` : '/api/v1/policy/flags');
  },

  // 5. Network & Flight Registry Analytics (M0B, M1)
  getRoutes: (limit = 100, offset = 0) =>
    request(`/api/v1/routes?limit=${limit}&offset=${offset}`),
  
  getFlights: (limit = 50, offset = 0, routeCode = null) => {
    const params = new URLSearchParams({ limit, offset });
    if (routeCode) params.append('route_code', routeCode);
    return request(`/api/v1/flights?${params.toString()}`);
  },

  getNetworkAnalytics: () =>
    request('/api/v1/analytics/network'),
  
  getAirlineAnalytics: (routeCode = null) =>
    request(routeCode ? `/api/v1/analytics/airlines?route_code=${encodeURIComponent(routeCode)}` : '/api/v1/analytics/airlines'),

  // 6. Airfare Observations & Provenance (M0A, M1)
  getFares: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(q ? `/api/v1/fares?${q}` : '/api/v1/fares');
  },

  getProvenance: () =>
    request('/api/v1/provenance'),
};

export default api;
