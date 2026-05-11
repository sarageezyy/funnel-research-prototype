// Shared state for the core-app 5-step flow.
// Persists to localStorage so each step loads the same census + company data.
(function () {
  // Bumped key to force refresh of defaults for the prototype.
  const KEY = 'pd_core_app_v4';

  function uid() {
    return 'm_' + Math.random().toString(36).slice(2, 10);
  }

  const EMPTY_MEMBER = () => ({
    uuid: uid(),
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    employee_type: '',
    gender: '',
    date_of_birth: '',
    home_state: '',
    home_zip: '',
    office_location_id: '',
    employee_information: {
      adminAccess: false,
      ownerStake: '',
      title: '',
      roleDescription: '',
      isRemote: null,
      remoteAddress: { address1: '', address2: '', city: '', state: '', zip: '' },
      salaryType: '',
      salary: '',
      hourlyRate: '',
      hoursWeekly: '',
      exemptionStatus: '',
    },
    health_ins_info: { isWaiving: false },
    dependent_censuses: [],
  });

  const DEFAULTS = {
    company: {
      company_name: 'Acme Supply Co.',
      dba: '',
      entityType: '',
      year_founded: '',
      filed_taxes_last_calendar_year: null,
      industry: '',
      industryNaics4: '',
      industryNaics6: '',
      health_insurance_information: {
        currentlyOfferHealthInsurance: null,
        controlledGroup: null,
        isInterestedInJustworksHI: null,
        startingCoverageDate: '',
        wantsManagedSales: null,
      },
    },
    offices: [],
    members: [EMPTY_MEMBER(), EMPTY_MEMBER()],
    applicationStatus: { stepsCompleted: [] },
  };

  function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return deepClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      return Object.assign(deepClone(DEFAULTS), parsed);
    } catch {
      return deepClone(DEFAULTS);
    }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  const state = load();

  window.coreApp = {
    get: () => state,
    save: () => save(state),
    newMember: EMPTY_MEMBER,
    addMember() {
      state.members.push(EMPTY_MEMBER());
      save(state);
    },
    removeMembers(uuids) {
      state.members = state.members.filter((m) => !uuids.includes(m.uuid));
      save(state);
    },
    markStepDone(stepKey) {
      if (!state.applicationStatus.stepsCompleted.includes(stepKey)) {
        state.applicationStatus.stepsCompleted.push(stepKey);
      }
      save(state);
    },
    reset() {
      const fresh = deepClone(DEFAULTS);
      Object.keys(state).forEach((k) => delete state[k]);
      Object.assign(state, fresh);
      save(state);
    },
  };
})();

// ----------- Shared reference data used by multiple steps -----------
window.CORE_APP_REF = {
  entityTypes: [
    'LLC',
    'Corporation or Professional Corporation',
    'Partnership',
    'Sole Proprietorship',
    'Single-Member LLC',
  ],
  employeeTypes: [
    { value: 'Owner/Partner Paid', label: 'Owner - Paid' },
    { value: 'Owner/Partner Unpaid', label: 'Owner - Unpaid' },
    { value: 'Employee - Full Time (W-2)', label: 'Employee - Full-time (W-2)' },
    { value: 'Employee - Part Time (W-2)', label: 'Employee - Part-time (W-2)' },
  ],
  salaryTypes: [
    { value: 'Annual salary', label: 'Annual salary' },
    { value: 'Hourly rate', label: 'Hourly rate' },
  ],
  exemptionStatuses: [
    { value: 'exempt', label: 'Exempt' },
    { value: 'non_exempt', label: 'Non-Exempt' },
  ],
  sexes: [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
  ],
  states: [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
  ],
  industriesNaics2: [
    'Agriculture, Forestry, Fishing and Hunting',
    'Construction',
    'Manufacturing',
    'Retail Trade',
    'Professional, Scientific, and Technical Services',
    'Information',
    'Finance and Insurance',
    'Health Care and Social Assistance',
    'Accommodation and Food Services',
    'Educational Services',
    'Other Services',
  ],
  industriesNaics4ByParent: {
    'Professional, Scientific, and Technical Services': [
      'Legal Services',
      'Accounting, Tax Preparation, Bookkeeping',
      'Architectural, Engineering, and Related Services',
      'Computer Systems Design and Related Services',
      'Management, Scientific, and Technical Consulting',
      'Advertising, Public Relations, and Related',
    ],
    Information: [
      'Publishing Industries (except Internet)',
      'Motion Picture and Sound Recording',
      'Broadcasting (except Internet)',
      'Telecommunications',
      'Data Processing, Hosting, and Related Services',
      'Other Information Services',
    ],
  },
  industriesNaics6ByParent: {
    'Computer Systems Design and Related Services': [
      'Custom Computer Programming Services',
      'Computer Systems Design Services',
      'Computer Facilities Management Services',
      'Other Computer Related Services',
    ],
    'Legal Services': [
      'Offices of Lawyers',
      'Offices of Notaries',
      'Title Abstract and Settlement Offices',
      'All Other Legal Services',
    ],
  },
  // Upcoming year + 11 months of coverage options
  coverageStartMonths() {
    const out = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 1; i <= 12; i++) {
      const next = new Date(d.getFullYear(), d.getMonth() + i, 1);
      out.push({
        value: next.toISOString().split('T')[0],
        label: next.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
    }
    return out;
  },
  years(start = 1900) {
    const now = new Date().getFullYear();
    const arr = [];
    for (let y = now; y >= start; y--) arr.push(String(y));
    return arr;
  },
};
