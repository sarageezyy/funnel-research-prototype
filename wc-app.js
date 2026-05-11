// Shared state for the Workers' Comp 7-step flow.
(function () {
  const KEY = 'pd_wc_app_v1';

  const DEFAULTS = {
    business_details: {
      ein: '',
      is_non_profit: null,
      hours_of_operation: '',
      owner_half_stake_other: null,
      related_entity: {
        legal_name: '',
        dba: '',
        description: '',
        has_w2_employees: null,
        ein: '',
        is_dependent: null,
        has_overlapping_employees: null,
        shares_location: null,
      },
    },
    about_your_team: {
      travel: null,
      hardware: null,
      employeesPhysicalLabor: null,
      hasContractors: null,
      employmentDuration: '',
      numberContractors: '',
      percentContractors: '',
      contractorWorkType: '',
      contractorsHaveWorkComp: null,
      contractorsHaveWorkersCompCOIS: null,
      numberTemp: '',
      boatsBridges: null,
      employeesWorkUnderground: null,
      employeesWorkOnLadders: null,
      employeePerformHeavyLifting: null,
      deliveries: null,
      physicalDisability: null,
      underageOrSenior: null,
      selectedTeammates: {},  // key: question name → array of uuids
    },
    about_your_business: {
      business_description: '',
      websites: [''],
      daily_operations: '',
      has_union_workers: null,
      documents: [],
    },
    business_attributes: {
      has_prior_carriers: null,
      prior_carriers: '',
      has_had_workers_comp_policy: null,
      been_cancelled: null,
      policy_cancelled_reason: '',
      has_past_due_premiums: null,
      been_declined: null,
      sponsors_sports_teams: null,
      has_tax_lien_bankruptcy: null,
      offer_health_insurance: null,
      own_aircraft_watercraft: null,
      use_3rd_party_vendors: null,
      third_party_work_details: '',
      third_party_work_location: '',
      third_party_business_arrangements: '',
      third_party_visit_details: '',
      has_volunteers: null,
      number_volunteers: '',
      volunteer_activities: '',
      has_volunteer_accident_policy: null,
      volunteer_travel: null,
      works_with_hazardous_materials: null,
      has_written_safety_program: null,
      documents: [],
    },
    attach_documents: {
      no_loss_run_report_reason: '',
      no_loss_run_report_other_reason: '',
      documents: [],
    },
    epli: {
      hasPolicy: null,
      noEpliLossRunsReportReason: '',
      noEpliLossRunsReportOtherReason: '',
      receivedEpliAllegations: null,
      beenSuedFormerEmp: null,
      claimDetails: '',
      overTwentyFiveEe: null,
      offeredSeverancePackages: null,
      documents: [],
    },
    review: { confirmed: false },
    stepsCompleted: [],
  };

  function deepClone(v) { return JSON.parse(JSON.stringify(v)); }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return deepClone(DEFAULTS);
      return Object.assign(deepClone(DEFAULTS), JSON.parse(raw));
    } catch { return deepClone(DEFAULTS); }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

  const state = load();

  window.wcApp = {
    get: () => state,
    save: () => save(state),
    markStepDone(key) {
      if (!state.stepsCompleted.includes(key)) state.stepsCompleted.push(key);
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
