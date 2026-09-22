/**
 * AegisVault Trustee Panel - Share Submission Module Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initFileUpload();
  initNotesCounter();
  initVaultSelectNotice();
  initFormSubmission();
  initFaqAccordion();
});

// State for active file
let currentSelectedFile = null;

/**
 * File Upload Drag & Drop & Browse Handling
 */
function initFileUpload() {
  const dropzone = document.getElementById('shareDropzone');
  const fileInput = document.getElementById('shareFileInput');
  const fileChip = document.getElementById('selectedFileChip');
  const fileNameEl = document.getElementById('selectedFileName');
  const fileSizeEl = document.getElementById('selectedFileSize');
  const removeBtn = document.getElementById('btnRemoveFile');

  if (!dropzone || !fileInput) return;

  const validExtensions = ['.share', '.txt', '.json', '.key'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function handleFile(file) {
    if (!file) return;

    // Check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      showToast(`Invalid file format (${ext}). Allowed: .share, .txt, .json, .key`, 'error');
      return;
    }

    // Check size
    if (file.size > maxSizeBytes) {
      showToast('File size exceeds the 10MB limit.', 'error');
      return;
    }

    currentSelectedFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatFileSize(file.size);

    dropzone.style.display = 'none';
    fileChip.style.display = 'flex';
    showToast(`Loaded "${file.name}" ready for client-side encryption.`);
  }

  // Browse via click
  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag & Drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Remove selected file
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSelectedFile = null;
      fileInput.value = '';
      fileChip.style.display = 'none';
      dropzone.style.display = 'flex';
      showToast('Selected file removed.');
    });
  }
}

/**
 * Notes Character Counter
 */
function initNotesCounter() {
  const notesArea = document.getElementById('submissionNotes');
  const counter = document.getElementById('charCounter');
  if (!notesArea || !counter) return;

  notesArea.addEventListener('input', () => {
    const count = notesArea.value.length;
    counter.textContent = `${count} / 500 characters`;
    if (count >= 480) {
      counter.style.color = 'var(--brand-orange)';
    } else {
      counter.style.color = 'var(--text-muted)';
    }
  });
}

/**
 * Vault Select Change Advisory Notice
 */
function initVaultSelectNotice() {
  const vaultSelect = document.getElementById('vaultSelect');
  if (!vaultSelect) return;

  vaultSelect.addEventListener('change', () => {
    const selectedOption = vaultSelect.options[vaultSelect.selectedIndex];
    const status = selectedOption.getAttribute('data-status');

    if (status === 'submitted') {
      showToast('Notice: A cryptographic share for Personal Vault was already recorded.', 'info');
    } else if (status === 'pending') {
      showToast('Notice: Trustee compliance check is in progress for this vault.', 'info');
    }
  });
}

/**
 * Form Submission & Client-Side Encryption Simulation
 */
function initFormSubmission() {
  const form = document.getElementById('shareSubmissionForm');
  const submitBtn = document.getElementById('btnSubmitShare');
  const vaultSelect = document.getElementById('vaultSelect');
  const tableBody = document.getElementById('submissionsTableBody');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentSelectedFile) {
      showToast('Please select or drop your cryptographic share file before submitting.', 'error');
      return;
    }

    const selectedOption = vaultSelect.options[vaultSelect.selectedIndex];
    const vaultNameFull = selectedOption.text.split('—')[0].trim();
    const fileName = currentSelectedFile.name;
    const fileSizeStr = (currentSelectedFile.size < 1024) 
      ? currentSelectedFile.size + ' B' 
      : (currentSelectedFile.size / 1024).toFixed(1) + ' KB';

    // Simulate encryption & processing state
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span>Encrypting & Submitting...</span>
    `;

    setTimeout(() => {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;

      // Generate simulated cryptographic values
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                      ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const txId = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...' +
                   Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const fullHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const subId = 'SUB-' + Math.floor(1000 + Math.random() * 9000);

      // Add new row to table at top
      if (tableBody) {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-sub-id', subId);
        newRow.style.backgroundColor = 'var(--brand-orange-tint)';
        newRow.style.transition = 'background-color 2s ease';

        newRow.innerHTML = `
          <td>${timeStr}</td>
          <td>
            <div class="table-vault-cell">
              <span class="table-lock-icon amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <span>${vaultNameFull}</span>
            </div>
          </td>
          <td><span class="table-file-name">${fileName}</span></td>
          <td>${fileSizeStr}</td>
          <td>
            <span class="status-pill submitted">
              <span class="status-pill-dot"></span>
              <span>Submitted</span>
            </span>
          </td>
          <td style="text-align: right;">
            <button class="table-action-dots-btn" title="View details" onclick="viewSubmissionDetails('${subId}', '${vaultNameFull}', '${fileName}', '${timeStr}', 'Submitted', '${txId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </td>
        `;

        tableBody.insertBefore(newRow, tableBody.firstChild);
        setTimeout(() => {
          newRow.style.backgroundColor = '';
        }, 2000);
      }

      // Populate Receipt Modal
      const receiptVaultName = document.getElementById('receiptVaultName');
      const receiptTxId = document.getElementById('receiptTxId');
      const receiptTimestamp = document.getElementById('receiptTimestamp');
      const receiptHash = document.getElementById('receiptHash');

      if (receiptVaultName) receiptVaultName.textContent = selectedOption.text.split('(')[0].trim();
      if (receiptTxId) receiptTxId.textContent = txId;
      if (receiptTimestamp) receiptTimestamp.textContent = timeStr;
      if (receiptHash) receiptHash.textContent = fullHash;

      // Open Success Modal
      if (window.openModal) {
        window.openModal('shareSuccessModal');
      }

      // Reset form state
      const dropzone = document.getElementById('shareDropzone');
      const fileChip = document.getElementById('selectedFileChip');
      const fileInput = document.getElementById('shareFileInput');
      const notesArea = document.getElementById('submissionNotes');
      const counter = document.getElementById('charCounter');

      currentSelectedFile = null;
      if (fileInput) fileInput.value = '';
      if (fileChip) fileChip.style.display = 'none';
      if (dropzone) dropzone.style.display = 'flex';
      if (notesArea) notesArea.value = '';
      if (counter) counter.textContent = '0 / 500 characters';

      showToast('Cryptographic share fragment successfully submitted and verified!');
    }, 850);
  });
}

/**
 * View Past Submission Details Modal
 */
window.viewSubmissionDetails = function(subId, vaultName, fileName, timestamp, status, txId) {
  const detailSubId = document.getElementById('detailSubId');
  const detailVaultName = document.getElementById('detailVaultName');
  const detailFileName = document.getElementById('detailFileName');
  const detailTimestamp = document.getElementById('detailTimestamp');
  const detailStatus = document.getElementById('detailStatus');
  const detailTx = document.getElementById('detailTx');

  if (detailSubId) detailSubId.textContent = subId;
  if (detailVaultName) detailVaultName.textContent = vaultName;
  if (detailFileName) detailFileName.textContent = fileName;
  if (detailTimestamp) detailTimestamp.textContent = timestamp;
  if (detailStatus) {
    detailStatus.textContent = status;
    detailStatus.style.color = status.toLowerCase().includes('failed') ? 'var(--accent-red)' : 'var(--accent-emerald)';
  }
  if (detailTx) detailTx.textContent = txId;

  if (window.openModal) {
    window.openModal('submissionDetailModal');
  }
};

/**
 * Download Proof Receipt
 */
window.downloadReceipt = function() {
  const vaultName = document.getElementById('receiptVaultName')?.textContent || 'Assigned Vault';
  const txId = document.getElementById('receiptTxId')?.textContent || '0x9f4a...e12d';
  const timestamp = document.getElementById('receiptTimestamp')?.textContent || new Date().toISOString();
  const hash = document.getElementById('receiptHash')?.textContent || 'N/A';

  const receiptContent = `=====================================================
AEGISVAULT CRYPTOGRAPHIC PROOF RECEIPT
Module 05: Share Submission
=====================================================
Target Vault:       ${vaultName}
Trustee Identity:   Rakesh Patel (RP-92841)
Consensus TX:       ${txId}
Timestamp:          ${timestamp}
Algorithm:          Shamir's Secret Sharing (2-of-3)
Encryption:         AES-GCM-256 (Client-Side)
SHA-256 Checksum:   ${hash}
Status:             VERIFIED & BUFFERED FOR QUORUM
=====================================================
This cryptographic proof certifies that the trustee fragment
was verified and accepted into the threshold release quorum.
`;

  const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AegisVault-Share-Receipt-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Receipt downloaded successfully!');
};

/**
 * FAQ Accordion Toggle
 */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.help-faq-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.help-faq-item');
      if (!item) return;

      const isOpen = item.classList.contains('open');

      // Close all other items
      document.querySelectorAll('.help-faq-item').forEach(el => {
        el.classList.remove('open');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}
