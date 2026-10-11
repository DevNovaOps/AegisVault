document.addEventListener('DOMContentLoaded', () => {
    // Dropdown for profile
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
          profileDropdown.classList.remove('show');
        }
      });
    }

    // Modal Handlers
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--text-muted)';
                b.style.borderBottom = '2px solid transparent';
            });
            btn.classList.add('active');
            btn.style.color = 'var(--brand-orange)';
            btn.style.borderBottom = '2px solid var(--brand-orange)';

            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.style.display = 'block';
        });
    });

    // Get Vault ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const vaultId = urlParams.get('id');

    if (!vaultId) {
        document.getElementById('vaultTitle').textContent = 'Vault Not Found';
        if (window.AegisOwner) window.AegisOwner.showToast('Invalid vault ID', 'error');
        return;
    }

    let currentVault = null;
    let vaultAssetsList = [];

    // Wire up Edit links to open edit modal in my-vaults.html
    const editUrl = `../my-vaults/my-vaults.html?edit=${encodeURIComponent(vaultId)}`;
    const btnEditThisVault = document.getElementById('btnEditThisVault');
    const btnGoToEditVault = document.getElementById('btnGoToEditVault');
    if (btnEditThisVault) btnEditThisVault.href = editUrl;
    if (btnGoToEditVault) btnGoToEditVault.href = editUrl;

    // Load Vault Details
    function loadVaultDetails() {
        if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) return;
        window.AegisAPI.get(`/owner/vaults/${vaultId}/`).then(vault => {
            currentVault = vault;
            document.getElementById('vaultTitle').textContent = vault.name;
            document.getElementById('vaultDesc').textContent = vault.description || vault.purpose || 'No description provided.';
            
            const badge = document.getElementById('vaultStatusBadge');
            badge.textContent = (vault.status || 'Active').toUpperCase();
            if ((vault.status || '').toLowerCase() === 'active') {
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = 'var(--status-success)';
            } else if ((vault.status || '').toLowerCase() === 'draft') {
                badge.style.background = 'rgba(107, 114, 128, 0.15)';
                badge.style.color = 'var(--text-muted)';
            } else {
                badge.style.background = 'rgba(249, 115, 22, 0.15)';
                badge.style.color = 'var(--brand-orange)';
            }

            document.getElementById('storageLabel').textContent = vault.storage_used || '0 MB used';

            // Populate Trustees info in Trustees tab
            const trusteesEl = document.getElementById('trusteesConfigDetails');
            if (trusteesEl) {
              trusteesEl.innerHTML = `
                <div style="padding: 1.5rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface);">
                  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div><span style="color:var(--text-muted); font-size:0.85rem;">Quorum Consensus:</span> <strong style="color:var(--text-primary); display:block; margin-top:0.25rem;">${vault.required_shares || 2} of ${vault.total_shares || 3} Approvals</strong></div>
                    <div><span style="color:var(--text-muted); font-size:0.85rem;">Trustees Registered:</span> <strong style="color:var(--text-primary); display:block; margin-top:0.25rem;">${vault.trustees_count || 0} active</strong></div>
                    <div><span style="color:var(--text-muted); font-size:0.85rem;">Shares Distribution:</span> <strong style="color:var(--text-primary); display:block; margin-top:0.25rem;">${vault.shares_ratio || '0 / 0'}</strong></div>
                  </div>
                  <p style="font-size:0.85rem; color:var(--text-muted);">Decryption requires ${vault.required_shares || 2} trustees to combine their cryptographic key shares.</p>
                </div>
              `;
            }

            // Populate Release policy info in Release tab
            const releaseEl = document.getElementById('releasePolicyDetails');
            if (releaseEl) {
              releaseEl.innerHTML = `
                <div style="padding: 1.5rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface);">
                  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div><span style="color:var(--text-muted); font-size:0.85rem;">Heartbeat Inactivity:</span> <strong style="color:var(--text-primary); display:block; margin-top:0.25rem;">Every ${vault.inactivity_days || 30} Days</strong></div>
                    <div><span style="color:var(--text-muted); font-size:0.85rem;">Release Trigger:</span> <strong style="color:var(--text-primary); display:block; margin-top:0.25rem;">Quorum Consensus Met</strong></div>
                  </div>
                  <div style="margin-top:1rem;">
                    <span style="color:var(--text-muted); font-size:0.85rem; display:block; margin-bottom:0.25rem;">Special Instructions:</span>
                    <p style="color:var(--text-primary); font-size:0.9rem; background:var(--bg-input); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--bg-input-border);">${vault.release_condition || 'Standard inactivity threshold verification.'}</p>
                  </div>
                </div>
              `;
            }
        }).catch(err => {
            if (window.AegisOwner) window.AegisOwner.showToast('Failed to load vault details', 'error');
            document.getElementById('vaultTitle').textContent = 'Error Loading Vault';
        });
    }

    // Load Vault Assets
    function loadVaultAssets() {
        if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) return;
        window.AegisAPI.get(`/owner/vaults/${vaultId}/assets/`).then(assets => {
            vaultAssetsList = Array.isArray(assets) ? assets : (assets.results || []);
            const tbody = document.getElementById('assetsListBody');
            tbody.innerHTML = '';
            
            if (vaultAssetsList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No protected assets stored yet in this vault. Click <strong>Edit Vault</strong> to upload files or add secure notes.</td></tr>`;
                return;
            }

            vaultAssetsList.forEach(asset => {
                const tr = document.createElement('tr');
                const isNote = asset.is_note || (asset.category === 'custom' || (!asset.file && !asset.download_url));
                const icon = isNote ? 
                    '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:18px;height:18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' : 
                    '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-info)" stroke-width="2" style="width:18px;height:18px;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
                
                let actionBtnHtml = '';
                if (isNote) {
                    actionBtnHtml = `<button class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem;" onclick="viewNote('${asset.id}')">View Note</button>`;
                } else if (asset.download_url) {
                    actionBtnHtml = `<a href="${asset.download_url}" target="_blank" download class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</a>`;
                } else {
                    actionBtnHtml = `<button class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem;" onclick="viewNote('${asset.id}')">View Details</button>`;
                }

                tr.innerHTML = `
                    <td style="display:flex; align-items:center; gap:0.75rem;">
                        ${icon}
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:500; color:var(--text-primary);">${asset.name}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${isNote ? 'Encrypted Secure Note' : (asset.mime_type || 'Protected File')}</span>
                        </div>
                    </td>
                    <td>${asset.category || (isNote ? 'Secure Note' : 'Document')}</td>
                    <td><span style="padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem; background:rgba(249,115,22,0.1); color:var(--brand-orange);">${asset.sensitivity || 'Sensitive'}</span></td>
                    <td>${formatBytes(asset.file_size_bytes)}</td>
                    <td>${new Date(asset.created_at).toLocaleDateString()}</td>
                    <td>
                        ${actionBtnHtml}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }).catch(err => {
            document.getElementById('assetsListBody').innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--status-critical); padding:2rem;">Failed to load assets.</td></tr>`;
        });
    }

    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // View Note Modal Handler
    window.viewNote = function(assetId) {
        const modal = document.getElementById('viewNoteModal');
        const titleEl = document.getElementById('viewNoteTitle');
        const metaEl = document.getElementById('viewNoteMeta');
        const dateEl = document.getElementById('viewNoteDate');
        const contentEl = document.getElementById('viewNoteContent');

        contentEl.textContent = 'Decrypting note content...';
        titleEl.textContent = 'Loading Note...';
        if (modal) modal.classList.add('active');

        window.AegisAPI.get(`/owner/vaults/${vaultId}/assets/${assetId}/`).then(data => {
            titleEl.textContent = data.name || 'Secure Note';
            if (metaEl) metaEl.textContent = `Category: ${data.category || 'Secure Note'} • Sensitivity: ${data.sensitivity || 'Sensitive'}`;
            if (dateEl) dateEl.textContent = new Date(data.created_at).toLocaleString();
            contentEl.textContent = data.decrypted_note || data.description || data.notes || '(Empty secure note)';
        }).catch(err => {
            contentEl.textContent = 'Failed to decrypt note: ' + err.message;
        });
    };

    // Initialize API logic
    if (window.AegisAPI) {
        loadVaultDetails();
        loadVaultAssets();
    } else {
        setTimeout(() => {
            if (window.AegisAPI) {
                loadVaultDetails();
                loadVaultAssets();
            }
        }, 300);
    }
});
