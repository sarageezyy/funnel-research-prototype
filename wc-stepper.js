// Renders the 7-step Workers' Comp stepper into #stepper.
window.WC_STEPS = [
  { label: 'Business details',    href: 'wc-business-details.html',    key: 'business-details' },
  { label: 'About your team',     href: 'wc-about-your-team.html',     key: 'about-your-team' },
  { label: 'About your business', href: 'wc-about-your-business.html', key: 'about-your-business' },
  { label: 'Business attributes', href: 'wc-business-attributes.html', key: 'business-attributes' },
  { label: 'Attach documents',    href: 'wc-attach-documents.html',    key: 'attach-documents' },
  { label: 'EPLI',                href: 'wc-epli.html',                key: 'epli' },
  { label: 'Review and submit',   href: 'wc-review.html',              key: 'review' },
];

window.wcRenderStepper = function (currentIdx) {
  const el = document.getElementById('stepper');
  if (!el) return;

  // Render step items
  el.classList.add('stepper-vertical');
  const completed = (window.wcApp?.get().stepsCompleted) || [];
  window.WC_STEPS.forEach((s, i) => {
    const li = document.createElement('li');
    const done = completed.includes(s.key) && i < currentIdx;
    const current = i === currentIdx;
    li.className = 'step' + (current ? ' current' : done ? ' done' : '');
    li.innerHTML = `<span class="step-num">${done ? '✓' : i + 1}</span>${s.label}`;
    el.appendChild(li);
  });

  // Restructure into a two-column grid: stepper on the left, form + footer on the right
  const parent = el.parentNode;
  const formWrap = parent.querySelector('.form-wrap');
  const footer = parent.querySelector('.action-footer');
  if (!formWrap) return;

  const layout = document.createElement('div');
  layout.className = 'stepper-layout';
  parent.insertBefore(layout, el);
  layout.appendChild(el);

  const content = document.createElement('div');
  content.className = 'stepper-content';
  layout.appendChild(content);
  content.appendChild(formWrap);
  if (footer) content.appendChild(footer);
};
