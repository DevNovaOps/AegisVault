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

    function resolveAssetUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const origin = (typeof window !== 'undefined' && window.location && window.location.port === '8000') 
            ? window.location.origin 
            : 'http://127.0.0.1:8000';
        return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
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
                
                const fileUrl = resolveAssetUrl(asset.download_url);
                let actionBtnHtml = '';
                if (isNote) {
                    actionBtnHtml = `
                        <button class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.35rem;" onclick="viewAsset('${asset.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View Note
                        </button>
                    `;
                } else {
                    actionBtnHtml = `
                        <div style="display:flex; gap:0.4rem; justify-content:flex-end;">
                            <button class="btn btn-primary" style="padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.35rem;" onclick="viewAsset('${asset.id}')" title="Preview file">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                View
                            </button>
                            ${fileUrl ? `
                                <a href="${fileUrl}" target="_blank" download class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.35rem;" title="Download file">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download
                                </a>
                            ` : ''}
                        </div>
                    `;
                }

                tr.innerHTML = `
                    <td style="display:flex; align-items:center; gap:0.75rem;">
                        ${icon}
                        <div style="display:flex; flex-direction:column;">
                            <span class="asset-name-link" style="font-weight:500; color:var(--text-primary); cursor:pointer; text-decoration:underline; text-decoration-color:transparent; transition:text-decoration-color 0.2s;" onmouseover="this.style.textDecorationColor='var(--brand-orange)'" onmouseout="this.style.textDecorationColor='transparent'" onclick="viewAsset('${asset.id}')">${asset.name}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${isNote ? 'Encrypted Secure Note' : (asset.mime_type || 'Protected File')}</span>
                        </div>
                    </td>
                    <td>${asset.category || (isNote ? 'Secure Note' : 'Document')}</td>
                    <td><span style="padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem; background:rgba(249,115,22,0.1); color:var(--brand-orange);">${asset.sensitivity || 'Sensitive'}</span></td>
                    <td>${formatBytes(asset.file_size_bytes)}</td>
                    <td>${new Date(asset.created_at).toLocaleDateString()}</td>
                    <td style="text-align:right;">
                        ${actionBtnHtml}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }).catch(err => {
            document.getElementById('assetsListBody').innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--status-critical); padding:2rem;">Failed to load assets: ${err.message}</td></tr>`;
        });
    }

    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Comprehensive Asset Viewer Modal Handler (PDFs, Images, Notes, Files)
    window.viewAsset = function(assetId) {
        const modal = document.getElementById('viewAssetModal');
        const titleEl = document.getElementById('assetPreviewTitle');
        const catEl = document.getElementById('assetPreviewCategory');
        const sizeEl = document.getElementById('assetPreviewSize');
        const sensEl = document.getElementById('assetPreviewSensitivity');
        const dateEl = document.getElementById('assetPreviewDate');
        const bodyEl = document.getElementById('assetPreviewBody');
        const openTabBtn = document.getElementById('assetPreviewOpenTab');
        const downloadBtn = document.getElementById('assetPreviewDownload');
        const iconEl = document.getElementById('assetPreviewIcon');

        if (!modal) return;
        bodyEl.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted); font-size:0.95rem;">Decrypting & loading asset...</div>`;
        modal.classList.add('active');

        // Fetch asset detail from backend
        window.AegisAPI.get(`/owner/vaults/${vaultId}/assets/${assetId}/`).then(data => {
            titleEl.textContent = data.name || 'Protected Asset';
            if (catEl) catEl.textContent = data.category || 'Asset';
            if (sizeEl) sizeEl.textContent = formatBytes(data.file_size_bytes);
            if (sensEl) sensEl.textContent = data.sensitivity || 'Sensitive';
            if (dateEl) dateEl.textContent = `Uploaded on ${new Date(data.created_at).toLocaleString()}`;

            const fileUrl = resolveAssetUrl(data.download_url);
            const isNote = data.is_note || (!data.download_url && (data.decrypted_note || data.encrypted_data || data.notes));
            const nameLower = (data.name || '').toLowerCase();
            const isPdf = nameLower.endsWith('.pdf') || (data.mime_type === 'application/pdf');
            const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(nameLower) || (data.mime_type && data.mime_type.startsWith('image/'));
            const isText = /\.(txt|md|json|csv|py|js|html)$/i.test(nameLower) || (data.mime_type && data.mime_type.startsWith('text/'));

            // Setup buttons
            if (fileUrl) {
                if (openTabBtn) {
                    openTabBtn.href = fileUrl;
                    openTabBtn.style.display = 'inline-flex';
                }
                if (downloadBtn) {
                    downloadBtn.href = fileUrl;
                    downloadBtn.setAttribute('download', data.name || 'asset');
                    downloadBtn.style.display = 'inline-flex';
                }
            } else {
                if (openTabBtn) openTabBtn.style.display = 'none';
                if (downloadBtn) downloadBtn.style.display = 'none';
            }

            if (isNote) {
                if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
                const noteText = data.decrypted_note || data.description || data.notes || '(Empty secure note)';
                bodyEl.innerHTML = `
                    <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-subtle); padding-bottom:0.75rem;">
                            <span style="font-size:0.85rem; color:var(--brand-orange); font-weight:600;">ENCRYPTED SECURE NOTE</span>
                            <button type="button" class="btn btn-secondary" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="navigator.clipboard.writeText('${encodeURIComponent(noteText)}'); window.AegisOwner ? window.AegisOwner.showToast('Note copied to clipboard') : alert('Copied!');">Copy Note</button>
                        </div>
                        <div style="white-space:pre-wrap; line-height:1.7; color:var(--text-primary); font-size:0.95rem;">${escapeHtml(noteText)}</div>
                    </div>
                `;
            } else if (isPdf && fileUrl) {
                if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-critical)" stroke-width="2" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="14" y1="13" x2="8" y2="13"/></svg>';
                bodyEl.innerHTML = `
                    <div style="display:flex; flex-direction:column; height:100%; gap:0.75rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-muted);">
                            <span>Viewing embedded PDF document: <strong>${escapeHtml(data.name)}</strong></span>
                            <a href="${fileUrl}" target="_blank" style="color:var(--brand-orange); text-decoration:none;">Open in separate window &rarr;</a>
                        </div>
                        <div style="width:100%; height:68vh; min-height:480px; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle); background:#333;">
                            <iframe src="${fileUrl}#toolbar=1" style="width:100%; height:100%; border:none; background:#fff;"></iframe>
                        </div>
                    </div>
                `;
            } else if (isImage && fileUrl) {
                if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-info)" stroke-width="2" style="width:22px;height:22px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                bodyEl.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid var(--border-subtle);">
                        <img src="${fileUrl}" alt="${escapeHtml(data.name)}" style="max-width:100%; max-height:68vh; object-fit:contain; border-radius:6px; box-shadow:0 8px 30px rgba(0,0,0,0.5);" />
                    </div>
                `;
            } else if (isText && fileUrl) {
                if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>';
                fetch(fileUrl).then(r => r.text()).then(text => {
                    bodyEl.innerHTML = `
                        <div style="padding:1rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px; max-height:65vh; overflow:auto;">
                            <pre style="margin:0; font-family:monospace; font-size:0.85rem; color:var(--text-primary); white-space:pre-wrap; line-height:1.5;">${escapeHtml(text)}</pre>
                        </div>
                    `;
                }).catch(() => {
                    showGenericFileCard(data, fileUrl, bodyEl);
                });
            } else {
                showGenericFileCard(data, fileUrl, bodyEl);
            }
        }).catch(err => {
            bodyEl.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--status-critical);">Failed to load asset details: ${err.message}</div>`;
        });
    };

    function showGenericFileCard(data, fileUrl, container) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1.5rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="1.5" style="width:64px;height:64px;margin-bottom:1rem;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <h4 style="color:var(--text-primary); margin-bottom:0.5rem; font-size:1.1rem;">${escapeHtml(data.name)}</h4>
                <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem;">Protected Digital File &bull; ${formatBytes(data.file_size_bytes)} &bull; ${data.mime_type || 'Encrypted File'}</p>
                <div style="display:flex; justify-content:center; gap:0.75rem;">
                    ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn btn-secondary" style="padding:0.5rem 1rem; text-decoration:none;">Open in New Tab</a>` : ''}
                    ${fileUrl ? `<a href="${fileUrl}" download class="btn btn-primary" style="padding:0.5rem 1rem; text-decoration:none;">Download File</a>` : ''}
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // View Note Modal Handler (backward compatibility)
    window.viewNote = function(assetId) {
        window.viewAsset(assetId);
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
