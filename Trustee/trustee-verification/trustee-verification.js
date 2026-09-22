/**
 * AegisVault Trustee Panel - Trustee Verification Controller
 * Handles animated progress indicators, step review modal inspections,
 * FAQ accordions, and simulated verification approval.
 */

document.addEventListener('DOMContentLoaded', () => {
  animateGauge();
  initStepClicks();
  initFaqAccordion();
});

// Animate Circular Gauge & Segment Bars
function animateGauge() {
  const gaugeFill = document.querySelector('.gauge-fill-circle');
  if (gaugeFill) {
    // 283 is full circumference. 75% complete = 283 - (283 * 0.75) = 70.75 offset
    gaugeFill.style.strokeDashoffset = '283';
    setTimeout(() => {
      gaugeFill.style.strokeDashoffset = '70.75';
    }, 200);
  }
}

// Verification Step Details
const STEP_DETAILS = {
  'step-1': {
    title: 'Personal Information',
    status: 'Completed',
    timestamp: '10 Sep 2025, 09:12 AM',
    fields: [
      { label: 'Full Legal Name', value: 'Rakesh Arvind Patel' },
      { label: 'Date of Birth', value: '14 May 1984' },
      { label: 'Residential Jurisdiction', value: 'California, United States' },
      { label: 'Verified Phone', value: '+1 (555) 382-9912' },
      { label: 'Primary Email', value: 'rakesh.patel@example.com' }
    ],
    note: 'Personal information has been cryptographically signed and matched against public records.'
  },
  'step-2': {
    title: 'Identity Document',
    status: 'Completed',
    timestamp: '11 Sep 2025, 04:30 PM',
    fields: [
      { label: 'Document Type', value: 'United States Passport' },
      { label: 'Document Number', value: '••••••8492' },
      { label: 'Issuing Authority', value: 'Department of State' },
      { label: 'Expiry Date', value: '14 Oct 2031' },
      { label: 'Optical Security Features', value: 'Hologram & MRZ Barcode Validated' }
    ],
    note: 'Government ID verification was completed via encrypted zero-knowledge document scan.'
  },
  'step-3': {
    title: 'Identity Verification (Biometric)',
    status: 'Completed',
    timestamp: '12 Sep 2025, 09:15 AM',
    fields: [
      { label: 'Verification Method', value: '3D Passive Liveness & Facial Geometry' },
      { label: 'Match Confidence', value: '99.82% Authentic Match' },
      { label: 'Spoof Detection', value: 'Passed (ISO 30107-3 Level 2 Compliant)' },
      { label: 'Biometric Hash', value: '0x8f2b...c91e' }
    ],
    note: 'Raw biometric images are immediately purged; only a cryptographic attestation proof is stored.'
  },
  'step-4': {
    title: 'Final Compliance Review',
    status: 'In Review',
    timestamp: 'Estimated: 1–2 days',
    fields: [
      { label: 'Review Stage', value: 'Institutional Trustee Compliance Check' },
      { label: 'Assigned Officer', value: 'Automated Audit System + Aegis Trust Agent' },
      { label: 'Estimated Completion', value: '14 Sep 2025 (Within 24 hours)' }
    ],
    note: 'Once final review is approved, your trustee account gains active custody authorization.'
  }
};

// Step Click Handlers
function initStepClicks() {
  const stepRows = document.querySelectorAll('.step-flow-row');
  stepRows.forEach(row => {
    row.addEventListener('click', () => {
      const stepId = row.getAttribute('data-step-id');
      const details = STEP_DETAILS[stepId];
      if (details) {
        openStepModal(stepId, details);
      }
    });
  });
}

function openStepModal(stepId, details) {
  const modal = document.getElementById('stepDetailModal');
  if (!modal) return;

  document.getElementById('modalStepTitle').textContent = details.title;
  document.getElementById('modalStepStatus').textContent = details.status;
  document.getElementById('modalStepStatus').className = `status-badge ${details.status === 'Completed' ? 'completed' : 'info'}`;
  document.getElementById('modalStepTime').textContent = details.timestamp;
  document.getElementById('modalStepNote').textContent = details.note;

  const fieldsContainer = document.getElementById('modalStepFields');
  fieldsContainer.innerHTML = '';

  details.fields.forEach(f => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid var(--border-subtle); font-size:0.84rem;';
    row.innerHTML = `<span style="color:var(--text-secondary);">${f.label}:</span><strong style="color:var(--text-primary);">${f.value}</strong>`;
    fieldsContainer.appendChild(row);
  });

  // If step 4 (in review), offer interactive simulation button
  const simBtn = document.getElementById('modalBtnSimulateApprove');
  if (simBtn) {
    if (stepId === 'step-4' && details.status !== 'Completed') {
      simBtn.style.display = 'inline-flex';
      simBtn.onclick = () => simulateFullVerification();
    } else {
      simBtn.style.display = 'none';
    }
  }

  window.openModal('stepDetailModal');
}

// Simulate full verification approval
function simulateFullVerification() {
  window.closeModal('stepDetailModal');

  // Update step 4 data
  STEP_DETAILS['step-4'].status = 'Completed';
  STEP_DETAILS['step-4'].timestamp = 'Approved Just Now';

  // Update step 4 UI row
  const step4Row = document.querySelector('[data-step-id="step-4"]');
  if (step4Row) {
    const marker = step4Row.querySelector('.step-marker-circle');
    marker.className = 'step-marker-circle completed';
    marker.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

    const pill = step4Row.querySelector('.step-status-pill');
    pill.className = 'step-status-pill completed';
    pill.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Completed';

    step4Row.querySelector('.step-timestamp').textContent = 'Just Now';
  }

  // Update progress card
  document.querySelector('.gauge-number').textContent = '100%';
  document.querySelector('.gauge-label').textContent = 'Verified';
  document.querySelector('.gauge-fill-circle').style.strokeDashoffset = '0';

  document.querySelector('.progress-title-highlight').textContent = 'You are fully verified, Rakesh!';
  document.querySelector('.progress-desc-text').textContent = 'All 4 required verification steps are complete. You now possess full trustee authorization.';
  document.querySelector('.step-segment-caption').textContent = '4 of 4 steps completed';

  document.querySelectorAll('.step-segment').forEach(s => s.classList.add('active'));

  const statusBadge = document.querySelector('.progress-status-box .status-badge');
  if (statusBadge) {
    statusBadge.className = 'status-badge completed';
    statusBadge.innerHTML = '<span class="badge-dot"></span>Verified';
  }

  window.showToast('🎉 Congratulations! Trustee identity verification has been fully confirmed.');
}

// FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.help-faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.help-faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close others
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}
