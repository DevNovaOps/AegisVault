/**
 * AegisVault Trustee Panel - Release Status Module Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/releases/').then(data => {
      window.RELEASE_DATA = data;
      renderReleaseTable();
      initTableFiltering();
      initFaqAccordion();
      updateMetricCounts();
    }).catch(err => {
      console.warn('Failed to load release status data:', err);
      renderReleaseTable();
      initTableFiltering();
      initFaqAccordion();
      updateMetricCounts();
    });
  } else {
    window.RELEASE_DATA = [];
    renderReleaseTable();
    initTableFiltering();
    initFaqAccordion();
    updateMetricCounts();
  }
});

function renderReleaseTable() {
  const tableBody = document.getElementById('releaseTableBody');
  if (!tableBody || !window.RELEASE_DATA) return;
  tableBody.innerHTML = '';
  
  window.RELEASE_DATA.forEach((req, index) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-vault', req.vault_name || 'Vault');
    tr.setAttribute('data-type', req.trigger_type || 'Unknown');
    tr.setAttribute('data-status', req.release_status || 'Pending');
    tr.setAttribute('data-id', req.release_id || '');
    
    let badgeClass = 'pending';
    let badgeIcon = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>';
    const statusLower = (req.release_status || '').toLowerCase();
    if (statusLower.includes('review') || statusLower.includes('progress')) {
      badgeClass = 'in-review';
      badgeIcon = '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>';
    } else if (statusLower.includes('approved') || statusLower.includes('released')) {
      badgeClass = 'approved';
      badgeIcon = '<circle cx="12" cy="12" r="10"/><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>';
    } else if (statusLower.includes('denied') || statusLower.includes('fail')) {
      badgeClass = 'denied';
      badgeIcon = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
    }

    const dateObj = req.created_at ? new Date(req.created_at) : new Date();
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    tr.innerHTML = `
      <td class="table-row-num">${index + 1}</td>
      <td>
        <div class="release-vault-cell">
          <span class="vault-cell-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
          <span>${req.vault_name || 'Vault'}</span>
        </div>
      </td>
      <td>${req.trigger_type || 'Manual Release'}</td>
      <td>
        <div class="table-date-time">
          <span class="date-main">${dateStr}</span>
          <span class="time-sub">${timeStr}</span>
        </div>
      </td>
      <td>
        <span class="status-badge ${badgeClass}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">${badgeIcon}</svg>
          <span>${req.release_status || 'Pending'}</span>
        </span>
      </td>
      <td class="next-step-cell">${req.participant_status === 'pending' ? 'Awaiting your submission' : 'Verified'}</td>
      <td style="text-align: right;">
        <button type="button" class="view-details-link" onclick="openReleaseDetails('${req.release_id || 'REQ-000'}', '${req.vault_name || 'Vault'}', '${req.trigger_type || 'Release'}', '${dateStr}, ${timeStr}', '${req.release_status || 'Pending'}', 'Next step', 'Owner', '${req.collected_shares || 0} of ${req.required_shares || 0} Shares Received', 1)">
          <span>View Details</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

/**
 * Filter Management & Live Search
 */
function initTableFiltering() {
  const tableBody = document.getElementById('releaseTableBody');
  const searchInput = document.getElementById('tableSearchInput');
  const vaultSelect = document.getElementById('tableVaultSelect');
  const filterStatus = document.getElementById('filterStatus');
  const filterType = document.getElementById('filterType');
  const btnApply = document.getElementById('btnApplyFilters');
  const btnClear = document.getElementById('btnClearFilters');

  if (!tableBody) return;

  function filterRows() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const selectedVault = (vaultSelect?.value || 'all').toLowerCase();
    const selectedStatus = (filterStatus?.value || 'all').toLowerCase();
    const selectedType = (filterType?.value || 'all').toLowerCase();

    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;

    rows.forEach(row => {
      const vault = (row.getAttribute('data-vault') || '').toLowerCase();
      const type = (row.getAttribute('data-type') || '').toLowerCase();
      const status = (row.getAttribute('data-status') || '').toLowerCase();
      const rowText = row.textContent.toLowerCase();

      const matchesSearch = !query || rowText.includes(query);
      const matchesVault = selectedVault === 'all' || vault.includes(selectedVault);
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
      const matchesType = selectedType === 'all' || type === selectedType;

      if (matchesSearch && matchesVault && matchesStatus && matchesType) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    // Check zero state
    let emptyRow = document.getElementById('tableEmptyStateRow');
    if (visibleCount === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.id = 'tableEmptyStateRow';
        emptyRow.innerHTML = `
          <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem; opacity: 0.6;">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">No release requests match the selected filters</div>
            <div style="font-size: 0.8rem;">Try selecting a different status or clear the active search filter.</div>
          </td>
        `;
        tableBody.appendChild(emptyRow);
      }
    } else if (emptyRow) {
      emptyRow.remove();
    }
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', filterRows);
  if (vaultSelect) vaultSelect.addEventListener('change', filterRows);
  if (filterStatus) filterStatus.addEventListener('change', filterRows);
  if (filterType) filterType.addEventListener('change', filterRows);

  if (btnApply) {
    btnApply.addEventListener('click', () => {
      filterRows();
      showToast('Filters applied successfully.');
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (vaultSelect) vaultSelect.value = 'all';
      if (filterStatus) filterStatus.value = 'all';
      if (filterType) filterType.value = 'all';
      filterRows();
      showToast('Filters cleared.');
    });
  }
}

/**
 * Filter by Clicking Hero Metric Cards
 */
window.filterByMetricStatus = function(statusName) {
  const filterStatus = document.getElementById('filterStatus');
  if (filterStatus) {
    filterStatus.value = statusName;
    const event = new Event('change');
    filterStatus.dispatchEvent(event);
    showToast(`Filtering by status: "${statusName}"`);
  }
};

/**
 * Open Release Request Breakdown Modal
 */
window.openReleaseDetails = function(reqId, vaultName, reqType, timestamp, status, nextStep, ownerName, quorumInfo, stepIndex) {
  const modalReqId = document.getElementById('modalReqId');
  const modalVaultName = document.getElementById('modalVaultName');
  const modalOwnerName = document.getElementById('modalOwnerName');
  const modalReqType = document.getElementById('modalReqType');
  const modalTimestamp = document.getElementById('modalTimestamp');
  const modalQuorum = document.getElementById('modalQuorum');

  if (modalReqId) modalReqId.textContent = reqId;
  if (modalVaultName) modalVaultName.textContent = vaultName;
  if (modalOwnerName) modalOwnerName.textContent = ownerName;
  if (modalReqType) modalReqType.textContent = reqType;
  if (modalTimestamp) modalTimestamp.textContent = timestamp;
  if (modalQuorum) {
    modalQuorum.textContent = quorumInfo;
    if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'released') {
      modalQuorum.style.color = 'var(--accent-emerald)';
    } else {
      modalQuorum.style.color = 'var(--brand-orange)';
    }
  }

  // Update step timeline nodes
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`trackStep${i}`);
    if (node) {
      node.className = 'track-step-node';
      if (i < stepIndex) {
        node.classList.add('completed');
      } else if (i === stepIndex) {
        node.classList.add('active');
      }
    }
  }

  if (window.openModal) {
    window.openModal('releaseDetailsModal');
  }
};

/**
 * FAQ Accordion Expansion
 */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.accordion-row-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-row-item');
      if (!item) return;

      const isOpen = item.classList.contains('open');

      // Close all other items
      document.querySelectorAll('.accordion-row-item').forEach(el => {
        el.classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/**
 * Update Metric Counts from Table
 */
function updateMetricCounts() {
  const rows = document.querySelectorAll('#releaseTableBody tr[data-status]');
  let pending = 0;
  let inReview = 0;
  let approved = 0;
  let released = 0;

  rows.forEach(row => {
    const status = (row.getAttribute('data-status') || '').toLowerCase();
    if (status === 'pending') pending++;
    else if (status === 'in review') inReview++;
    else if (status === 'approved') approved++;
    else if (status === 'released') released++;
  });

  const countPendingEl = document.getElementById('countPending');
  const countInReviewEl = document.getElementById('countInReview');
  const countApprovedEl = document.getElementById('countApproved');
  const countReleasedEl = document.getElementById('countReleased');

  if (countPendingEl) countPendingEl.textContent = pending || 6;
  if (countInReviewEl) countInReviewEl.textContent = inReview || 2;
  if (countApprovedEl) countApprovedEl.textContent = approved || 3;
  if (countReleasedEl) countReleasedEl.textContent = released || 1;
}
