// Shared Add-a-team-member drawer. Injected into any core-app page that wants it.
// After each save it appends to window.coreApp's member list and dispatches a
// `pd:members-updated` event so the host page can re-render its table.

(function () {
  if (window.__pdMemberDrawerMounted) return;
  window.__pdMemberDrawerMounted = true;

  const CSS = `
    .member-drawer { width: 560px; }
    .member-drawer .drawer-section { display: flex; flex-direction: column; gap: 14px; }
    .member-drawer .drawer-section + .drawer-section {
      margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB;
    }
    .member-drawer .drawer-section-label {
      font-size: 12px; font-weight: 700; color: #6B7280;
      letter-spacing: 0.04em; text-transform: uppercase; margin: 0;
    }
    .member-drawer .inline-check {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 12px 14px; border: 1.5px solid #D1D5DB; border-radius: 6px; cursor: pointer;
    }
    .member-drawer .inline-check input { margin-top: 2px; accent-color: #1A56DB; }
    .member-drawer .inline-check-text { font-size: 14px; color: #111827; }
    .member-drawer .inline-check-text small {
      display: block; font-size: 12px; color: #6B7280; margin-top: 4px; line-height: 1.5;
    }
    .member-drawer .sub-heading { font-size: 13px; font-weight: 600; color: #111827; margin: 6px 0 0; }
    .member-drawer .sub-heading-hint { font-size: 12px; color: #6B7280; margin: 2px 0 6px; line-height: 1.5; }

    body.drawer-open #pd-reset-btn { display: none !important; }
    #pd-drawer-close {
      position: fixed; top: 16px; right: 16px; z-index: 10000;
      padding: 8px 14px; background: rgba(17, 24, 39, 0.78); color: #FFFFFF;
      border: none; border-radius: 6px; font-size: 12px; font-weight: 600;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      box-shadow: 0 1px 3px rgba(0,0,0,0.18); display: none;
    }
    #pd-drawer-close.visible { display: inline-flex; align-items: center; gap: 6px; }
    #pd-drawer-close:hover { background: rgba(17, 24, 39, 0.95); }
  `;

  const MARKUP = `
    <div class="drawer-backdrop" id="member-backdrop"></div>
    <aside class="drawer member-drawer" id="member-drawer" aria-hidden="true">
      <div class="drawer-header">
        <h3>Add a team member</h3>
        <button class="drawer-close" id="member-close" aria-label="Close">×</button>
      </div>
      <div class="drawer-body">
        <form id="member-form" onsubmit="return false">
          <section class="drawer-section">
            <p class="drawer-section-label">Basics</p>
            <div class="field">
              <label class="field-label" for="m-first">Legal first name</label>
              <input id="m-first" type="text" />
            </div>
            <div class="field">
              <label class="field-label" for="m-middle">Legal middle name <span class="field-optional">Optional</span></label>
              <input id="m-middle" type="text" />
            </div>
            <div class="field">
              <label class="field-label" for="m-last">Legal last name</label>
              <input id="m-last" type="text" />
            </div>
            <div class="field">
              <label class="field-label" for="m-email">Work email</label>
              <input id="m-email" type="email" />
            </div>
            <div class="field">
              <label class="field-label" for="m-type">Profile type</label>
              <select id="m-type"><option value="" disabled selected></option></select>
            </div>
            <div class="field" id="m-owner-field" hidden>
              <label class="field-label" for="m-owner">Ownership %</label>
              <input id="m-owner" type="number" min="5" max="100" />
            </div>
            <label class="inline-check" id="m-admin-wrap" hidden>
              <input type="checkbox" id="m-admin" />
              <span class="inline-check-text">
                Admin access
                <small>Admins will be granted company-level permissions such as scheduling payments, managing time off policies, and uploading documents.</small>
              </span>
            </label>
          </section>

          <section class="drawer-section">
            <p class="drawer-section-label">Job details</p>
            <div class="field">
              <label class="field-label" for="m-title">Job title</label>
              <input id="m-title" type="text" />
            </div>
            <div class="field">
              <label class="field-label" for="m-duty">Job duty</label>
              <textarea id="m-duty" rows="3"></textarea>
            </div>
            <div class="field">
              <label class="field-label">Work location</label>
              <div class="radio-buttons" data-group="isRemote">
                <label><input type="radio" name="isRemote" value="true" /><span>Remote</span></label>
                <label><input type="radio" name="isRemote" value="false" /><span>In Office</span></label>
              </div>
            </div>
            <div class="field" id="m-office-field" hidden>
              <label class="field-label" for="m-office">Office location</label>
              <select id="m-office"><option value="" disabled selected></option></select>
            </div>
            <div id="m-remote-addr" hidden>
              <p class="sub-heading">Remote location</p>
              <p class="sub-heading-hint">No PO Boxes, business mailing addresses, or virtual mailboxes.</p>
              <div class="field">
                <label class="field-label" for="m-addr1">Street 1</label>
                <input id="m-addr1" type="text" />
              </div>
              <div class="field">
                <label class="field-label" for="m-addr2">Street 2 <span class="field-optional">Optional</span></label>
                <input id="m-addr2" type="text" />
              </div>
              <div class="field">
                <label class="field-label" for="m-city">City</label>
                <input id="m-city" type="text" />
              </div>
              <div class="row">
                <div class="field">
                  <label class="field-label" for="m-state">State</label>
                  <select id="m-state"><option value="" disabled selected></option></select>
                </div>
                <div class="field">
                  <label class="field-label" for="m-zip">ZIP code</label>
                  <input id="m-zip" type="text" />
                </div>
              </div>
            </div>
          </section>

          <section class="drawer-section" id="m-pay-section">
            <p class="drawer-section-label">Pay info</p>
            <div class="field">
              <label class="field-label">Pay basis</label>
              <div class="radio-buttons" data-group="salaryType">
                <label><input type="radio" name="salaryType" value="Annual salary" /><span>Annual salary</span></label>
                <label><input type="radio" name="salaryType" value="Hourly rate" /><span>Hourly rate</span></label>
              </div>
            </div>
            <div class="field" id="m-salary-field" hidden>
              <label class="field-label" for="m-salary">Annual salary</label>
              <input id="m-salary" type="number" min="0" />
            </div>
            <div class="row" id="m-hourly-row" hidden>
              <div class="field">
                <label class="field-label" for="m-hourly">Hourly wage</label>
                <input id="m-hourly" type="number" min="0" />
              </div>
              <div class="field">
                <label class="field-label" for="m-hours">Hours per week</label>
                <input id="m-hours" type="number" min="1" max="168" />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Exemption status</label>
              <div class="radio-buttons" data-group="exemption">
                <label><input type="radio" name="exemption" value="exempt" /><span>Exempt</span></label>
                <label><input type="radio" name="exemption" value="non_exempt" /><span>Non-Exempt</span></label>
              </div>
            </div>
          </section>

          <section class="drawer-section" id="m-hi-section">
            <p class="drawer-section-label">Health insurance info</p>
            <div class="field">
              <label class="field-label" for="m-dob">Date of birth</label>
              <input id="m-dob" type="date" />
            </div>
            <div class="field">
              <label class="field-label">Sex</label>
              <div class="field-hint">Use the sex listed on their official ID.</div>
              <div class="radio-buttons" data-group="sex">
                <label><input type="radio" name="sex" value="M" /><span>Male</span></label>
                <label><input type="radio" name="sex" value="F" /><span>Female</span></label>
              </div>
            </div>
            <div class="field">
              <label class="field-label" for="m-home-zip">Home zip code</label>
              <input id="m-home-zip" type="text" />
            </div>
          </section>
        </form>
      </div>
      <div class="drawer-footer">
        <button class="btn-secondary" id="member-save">Save</button>
        <button class="btn-primary" id="member-save-another">Save and add another</button>
      </div>
    </aside>
    <button type="button" id="pd-drawer-close" aria-label="Close drawer">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      Close
    </button>
  `;

  function mount() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.innerHTML = MARKUP;
    while (container.firstChild) document.body.appendChild(container.firstChild);

    init();
  }

  function init() {
    const state = window.coreApp.get();
    const ref = window.CORE_APP_REF;

    const backdrop = document.getElementById('member-backdrop');
    const drawer = document.getElementById('member-drawer');
    const floatClose = document.getElementById('pd-drawer-close');

    // Populate profile-type + state selects once
    const typeSel = document.getElementById('m-type');
    ref.employeeTypes.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.value; opt.textContent = t.label;
      typeSel.appendChild(opt);
    });
    const stateSel = document.getElementById('m-state');
    ref.states.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      stateSel.appendChild(opt);
    });

    function refreshOfficeOptions() {
      const sel = document.getElementById('m-office');
      sel.innerHTML = '<option value="" disabled selected></option>';
      state.offices.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o.id; opt.textContent = o.location_name || o.city || 'Office';
        sel.appendChild(opt);
      });
    }

    function wireRadio(groupName, onChange) {
      const labels = document.querySelectorAll(`[data-group="${groupName}"] label`);
      labels.forEach((label) => {
        const input = label.querySelector('input');
        input.addEventListener('change', () => {
          labels.forEach((l) => l.classList.remove('checked'));
          label.classList.add('checked');
          if (onChange) onChange(input.value);
        });
      });
    }

    wireRadio('isRemote', (val) => {
      document.getElementById('m-office-field').hidden = val !== 'false';
      document.getElementById('m-remote-addr').hidden = val !== 'true';
    });
    wireRadio('salaryType', (val) => {
      document.getElementById('m-salary-field').hidden = val !== 'Annual salary';
      document.getElementById('m-hourly-row').hidden = val !== 'Hourly rate';
    });
    wireRadio('exemption');
    wireRadio('sex');

    document.getElementById('m-type').addEventListener('change', () => {
      const type = document.getElementById('m-type').value;
      const isOwner = type.startsWith('Owner');
      const isEmployee = type.startsWith('Employee');
      document.getElementById('m-owner-field').hidden = !isOwner;
      document.getElementById('m-admin-wrap').hidden = !isEmployee;
    });

    function resetForm() {
      document.getElementById('member-form').reset();
      document.querySelectorAll('.member-drawer .radio-buttons label').forEach((l) => l.classList.remove('checked'));
      document.getElementById('m-owner-field').hidden = true;
      document.getElementById('m-admin-wrap').hidden = true;
      document.getElementById('m-office-field').hidden = true;
      document.getElementById('m-remote-addr').hidden = true;
      document.getElementById('m-salary-field').hidden = true;
      document.getElementById('m-hourly-row').hidden = true;
      refreshOfficeOptions();
    }

    function openDrawer() {
      resetForm();
      backdrop.classList.add('open');
      drawer.classList.add('open');
      document.body.classList.add('drawer-open');
      floatClose.classList.add('visible');
    }
    function closeDrawer() {
      backdrop.classList.remove('open');
      drawer.classList.remove('open');
      document.body.classList.remove('drawer-open');
      floatClose.classList.remove('visible');
    }

    backdrop.addEventListener('click', closeDrawer);
    document.getElementById('member-close').addEventListener('click', closeDrawer);
    floatClose.addEventListener('click', closeDrawer);

    function readForm() {
      const type = document.getElementById('m-type').value;
      const isRemote = document.querySelector('input[name="isRemote"]:checked')?.value;
      const salaryType = document.querySelector('input[name="salaryType"]:checked')?.value;
      const m = window.coreApp.newMember();
      m.first_name = document.getElementById('m-first').value;
      m.middle_name = document.getElementById('m-middle').value;
      m.last_name = document.getElementById('m-last').value;
      m.email = document.getElementById('m-email').value;
      m.employee_type = type;
      m.employee_information.ownerStake = document.getElementById('m-owner').value;
      m.employee_information.adminAccess =
        type.startsWith('Owner') ? true : document.getElementById('m-admin').checked;
      m.employee_information.title = document.getElementById('m-title').value;
      m.employee_information.roleDescription = document.getElementById('m-duty').value;
      m.employee_information.isRemote = isRemote == null ? null : isRemote === 'true';
      m.office_location_id = document.getElementById('m-office').value;
      m.employee_information.remoteAddress = {
        address1: document.getElementById('m-addr1').value,
        address2: document.getElementById('m-addr2').value,
        city: document.getElementById('m-city').value,
        state: document.getElementById('m-state').value,
        zip: document.getElementById('m-zip').value,
      };
      m.employee_information.salaryType = salaryType || '';
      m.employee_information.salary = document.getElementById('m-salary').value;
      m.employee_information.hourlyRate = document.getElementById('m-hourly').value;
      m.employee_information.hoursWeekly = document.getElementById('m-hours').value;
      m.employee_information.exemptionStatus =
        document.querySelector('input[name="exemption"]:checked')?.value || '';
      m.date_of_birth = document.getElementById('m-dob').value;
      m.gender = document.querySelector('input[name="sex"]:checked')?.value || '';
      m.home_zip = document.getElementById('m-home-zip').value;
      return m;
    }

    function save(keepOpen) {
      state.members.push(readForm());
      window.coreApp.save();
      window.dispatchEvent(new CustomEvent('pd:members-updated'));
      if (keepOpen) resetForm();
      else closeDrawer();
    }
    document.getElementById('member-save').addEventListener('click', () => save(false));
    document.getElementById('member-save-another').addEventListener('click', () => save(true));

    // Auto-bind any element with [data-add-member] (top toolbar, bottom-of-table, etc.)
    function bindAddButtons() {
      document.querySelectorAll('[data-add-member]').forEach((btn) => {
        if (btn.__pdBound) return;
        btn.__pdBound = true;
        btn.addEventListener('click', openDrawer);
      });
    }
    bindAddButtons();
    // Re-bind whenever a page re-renders rows (bottom button may live next to the table)
    window.addEventListener('pd:rebind-add', bindAddButtons);

    window.memberDrawer = { open: openDrawer, close: closeDrawer };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
