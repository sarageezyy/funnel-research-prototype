// Shared prototype state — persisted to localStorage so it survives page navigation.
(function () {
  const KEY = 'pd_mvp_store';

  const DEFAULTS = {
    path: null,                  // 'guided' | 'fast' | 'mvp'
    fastProduct: null,
    location: null,              // 'one-state' | 'multi-state'
    internationalWorkers: [],    // ['contractors'] | ['eor-employees'] | []
    companySize: null,           // 'solo' | '2-39' | '40-99' | '100plus'
    coEmployment: null,          // 'yes' | 'no'
    healthInsurance: null,       // 'yes-jw' | 'not-now' | 'existing'
    timeline: null,              // 'specific' | '3-months' | 'exploring'
    timelineDate: null,
    firstName: null,
    lastName: null,
    companyName: null,
    notes: null,
    questionnaireComplete: false,
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  const state = load();

  window.pdStore = {
    get: () => state,
    set(patch) {
      Object.assign(state, patch);
      save(state);
    },
    reset() {
      Object.assign(state, DEFAULTS, { internationalWorkers: [] });
      save(state);
    },
  };
})();
