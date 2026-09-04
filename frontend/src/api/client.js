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

  // 7. Live Data Acquisition Pipeline (M7)
  getLiveStatus: () =>
    request('/api/v1/live/status'),

  fetchLiveData: (routeCode = 'DEL-BOM', advancePurchaseWindow = 7) =>
    request('/api/v1/live/fetch', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        route_code: routeCode,
        advance_purchase_window: advancePurchaseWindow,
      }),
    }),

  getLiveHistory: (limit = 20) =>
    request(`/api/v1/live/history?limit=${limit}`),

  getLiveSources: () =>
    request('/api/v1/live/sources'),

  // 8. Government & Institutional API Layer (M7)
  getGovernmentIndexLatest: () =>
    request('/api/v1/government/index/latest'),

  getGovernmentIndexSummary: () =>
    request('/api/v1/government/index/summary'),

  getGovernmentRoutes: () =>
    request('/api/v1/government/routes'),

  getGovernmentProvenance: () =>
    request('/api/v1/government/provenance'),

  getGovernmentDataStatus: () =>
    request('/api/v1/government/data-status'),

  // 9. National Corridor Explorer (M7)
  getTop10Corridors: () =>
    request('/api/v1/corridors/top10'),

  getCorridorDetails: (routeCode) =>
    request(`/api/v1/corridors/${encodeURIComponent(routeCode)}`),

  // 10. Airfare Acquisition Lab (M8)
  getAcquisitionSources: () =>
    request('/api/v1/acquisition/sources'),

  runAcquisitionPipeline: (sourceId = 'demo_airfare_connector', routeCode = 'DEL-BOM', advancePurchaseWindow = 15, departureDate = null) =>
    request('/api/v1/acquisition/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_id: sourceId,
        route_code: routeCode,
        advance_purchase_window: advancePurchaseWindow,
        departure_date: departureDate
      }),
    }),

  getAcquisitionHistory: (limit = 20) =>
    request(`/api/v1/acquisition/history?limit=${limit}`),

  getAcquisitionObservations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(q ? `/api/v1/acquisition/observations?${q}` : '/api/v1/acquisition/observations');
  },

  getAcquisitionScenarios: () =>
    request('/api/v1/acquisition/scenarios'),

  getAcquisitionCompare: (runId) =>
    request(`/api/v1/acquisition/compare/${encodeURIComponent(runId)}`),
};

export default api;
