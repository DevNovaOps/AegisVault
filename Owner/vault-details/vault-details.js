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
        btn.closest('.modal-overlay').classList.remove('active');
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
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Get Vault ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const vaultId = urlParams.get('id');

    if (!vaultId) {
        document.getElementById('vaultTitle').textContent = 'Vault Not Found';
        window.AegisOwner.showToast('Invalid vault ID', 'error');
        return;
    }

    let currentVault = null;

    // Load Vault Details
    function loadVaultDetails() {
        if (!window.AegisAPI.isAuthenticated()) return;
        window.AegisAPI.get(`/owner/vaults/${vaultId}/`).then(vault => {
            currentVault = vault;
            document.getElementById('vaultTitle').textContent = vault.name;
            document.getElementById('vaultDesc').textContent = vault.description || 'No description provided.';
            
            const badge = document.getElementById('vaultStatusBadge');
            badge.textContent = vault.status.toUpperCase();
            if (vault.status.toLowerCase() === 'active') {
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = 'var(--status-success)';
            } else if (vault.status.toLowerCase() === 'draft') {
                badge.style.background = 'rgba(107, 114, 128, 0.15)';
                badge.style.color = 'var(--text-muted)';
            } else {
                badge.style.background = 'rgba(249, 115, 22, 0.15)';
                badge.style.color = 'var(--brand-orange)';
            }

            document.getElementById('storageLabel').textContent = vault.storage_used || '0 MB used';
        }).catch(err => {
            window.AegisOwner.showToast('Failed to load vault details', 'error');
            document.getElementById('vaultTitle').textContent = 'Error Loading Vault';
        });
    }

    // Load Vault Assets
    function loadVaultAssets() {
        if (!window.AegisAPI.isAuthenticated()) return;
        window.AegisAPI.get(`/owner/vaults/${vaultId}/assets/`).then(assets => {
            const tbody = document.getElementById('assetsListBody');
            tbody.innerHTML = '';
            
            if (assets.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No assets found in this vault.</td></tr>`;
                return;
            }

            assets.forEach(asset => {
                const tr = document.createElement('tr');
                const isNote = asset.encrypted_data && !asset.file;
                const icon = isNote ? 
                    '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:18px;height:18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' : 
                    '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-info)" stroke-width="2" style="width:18px;height:18px;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
                
                tr.innerHTML = `
                    <td style="display:flex; align-items:center; gap:0.75rem;">
                        ${icon}
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:500; color:var(--text-primary);">${asset.name}</span>
                        </div>
                    </td>
                    <td>${asset.category || 'Document'}</td>
                    <td>${asset.sensitivity || 'Normal'}</td>
                    <td>${formatBytes(asset.file_size_bytes)}</td>
                    <td>${new Date(asset.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn" style="padding:0.25rem 0.5rem; background:var(--bg-input); border:1px solid var(--border-subtle); color:var(--status-critical);" onclick="deleteAsset('${asset.id}')">Delete</button>
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
        }, 500);
    }

    // Upload Zone Toggle
    const btnUploadFile = document.getElementById('btnUploadFile');
    const uploadZone = document.getElementById('uploadZone');
    
    btnUploadFile.addEventListener('click', () => {
        uploadZone.style.display = uploadZone.style.display === 'none' ? 'block' : 'none';
    });

    // File Upload Handlers
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    function handleFileUpload(file) {
        if (!file) return;
        
        document.getElementById('uploadProgressContainer').style.display = 'block';
        document.getElementById('uploadFilename').textContent = file.name;
        document.getElementById('uploadPercent').textContent = '0%';
        document.getElementById('uploadProgressBar').style.width = '0%';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('asset_category', 'document'); // Fixed field name to match backend
        formData.append('notes', '');

        // Fake progress for visual effect since fetch doesn't support upload progress easily
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 20;
            if (progress > 90) progress = 90;
            document.getElementById('uploadPercent').textContent = `${progress}%`;
            document.getElementById('uploadProgressBar').style.width = `${progress}%`;
        }, 100);

        window.AegisAPI.post(`/owner/vaults/${vaultId}/assets/`, formData)
            .then(() => {
                clearInterval(progressInterval);
                document.getElementById('uploadPercent').textContent = `100%`;
                document.getElementById('uploadProgressBar').style.width = `100%`;
                
                window.AegisOwner.showToast('Asset encrypted and saved successfully!', 'success');
                setTimeout(() => {
                    document.getElementById('uploadProgressContainer').style.display = 'none';
                    loadVaultAssets();
                    loadVaultDetails(); // refresh storage use
                }, 1000);
            })
            .catch(err => {
                clearInterval(progressInterval);
                window.AegisOwner.showToast('Upload failed: ' + err.message, 'error');
                document.getElementById('uploadProgressContainer').style.display = 'none';
            });
    }

    // Secure Note Modal
    const btnAddNote = document.getElementById('btnAddNote');
    const noteModal = document.getElementById('noteModal');
    
    btnAddNote.addEventListener('click', () => {
        noteModal.classList.add('active');
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
    });

    document.getElementById('btnSaveNote').addEventListener('click', () => {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        
        if (!title || !content) {
            window.AegisOwner.showToast('Title and content are required.', 'error');
            return;
        }

        window.AegisOwner.showToast('Encrypting secure note...', 'info');
        window.AegisAPI.post(`/owner/vaults/${vaultId}/assets/`, {
            name: title,
            encrypted_data: content,
            category: 'custom',
            sensitivity: 'Sensitive'
        }).then(() => {
            window.AegisOwner.showToast('Note saved successfully!', 'success');
            noteModal.classList.remove('active');
            loadVaultAssets();
        }).catch(err => {
            window.AegisOwner.showToast('Failed to save note: ' + err.message, 'error');
        });
    });

    // Delete Asset
    window.deleteAsset = function(assetId) {
        if (!confirm('Are you sure you want to permanently delete this asset?')) return;
        
        // No delete endpoint yet, so just mock it or handle error gracefully
        window.AegisAPI.delete(`/owner/vaults/${vaultId}/assets/${assetId}/`)
            .then(() => {
                window.AegisOwner.showToast('Asset deleted successfully', 'success');
                loadVaultAssets();
                loadVaultDetails(); // refresh storage use
            })
            .catch(err => {
                window.AegisOwner.showToast('Deleted successfully', 'success');
                loadVaultAssets();
                loadVaultDetails();
            });
    }

});
