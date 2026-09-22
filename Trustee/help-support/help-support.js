/**
 * AegisVault Trustee Panel — Module 10: Help & Support JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Articles Data Store
  const articlesData = {
    'first-vault': {
      category: 'VAULT MANAGEMENT',
      readTime: '5 min read',
      title: 'Setting Up Your First Vault',
      content: `
        <h3>1. Introduction to Vault Provisioning</h3>
        <p>AegisVault empowers individuals and family offices to safeguard mission-critical digital assets, cryptographic seeds, legal directives, and sentimental records. Every vault created is isolated via client-side AES-256-GCM encryption.</p>
        
        <div class="article-reader-callout">
          <strong>Key Rule:</strong> Master keys never touch AegisVault servers unencrypted. You retain sovereign mathematical ownership at all times.
        </div>

        <h3>2. Defining Quorum and Appointing Trustees</h3>
        <p>During the vault creation ceremony, you determine your <strong>M-of-N Quorum Threshold</strong>:</p>
        <ul>
          <li><strong>Total Trustees (N):</strong> The total number of trusted delegates who will hold a cryptographic fragment.</li>
          <li><strong>Required Quorum (M):</strong> The minimum number of shares necessary to reconstruct the master decryption key (e.g., 2 of 3, or 3 of 5).</li>
        </ul>

        <h3>3. Initializing the Shamir Ceremony</h3>
        <p>Once trustees are appointed, AegisVault executes Shamir's Secret Sharing (SSSS) within your local browser sandbox. The individual polynomial shares are packaged into encrypted payloads and transmitted directly to your verified trustees.</p>

        <h3>4. Verification and Safeguards</h3>
        <p>Before any share is considered active, trustees must complete Level 2 Identity Verification and register a FIDO2 hardware authenticator or biometric passkey.</p>
      `
    },
    'release-process': {
      category: 'SHARE & RELEASE',
      readTime: '3 min read',
      title: 'Understanding the Release Process',
      content: `
        <h3>1. Release Triggers</h3>
        <p>A vault release can be triggered by predefined conditions, including verified death certificates, prolonged inactivity (Dead Man's Switch), legal mandate, or formal beneficiary petition.</p>
        
        <div class="article-reader-callout">
          <strong>Mandatory Grace Period:</strong> Every release triggers an immutable 48–72 hour grace period during which the vault owner is notified via multiple encrypted channels to prevent false positives.
        </div>

        <h3>2. Trustee Quorum Aggregation</h3>
        <p>Once the grace period concludes, appointed trustees receive a cryptographic alert. Each trustee must:</p>
        <ul>
          <li>Authenticate using their registered FIDO2 hardware key.</li>
          <li>Access the <strong>Share Submission</strong> module.</li>
          <li>Upload or submit their encrypted share fragment.</li>
        </ul>

        <h3>3. Consensus & Payload Decryption</h3>
        <p>When the required threshold of valid shares is submitted, our client-side zero-knowledge engine combines the polynomial points to reconstruct the vault master key, securely dispatching authorized contents to verified beneficiaries.</p>
      `
    },
    'trustee-permissions': {
      category: 'TRUSTEES & INVITES',
      readTime: '4 min read',
      title: 'Managing Trustee Permissions',
      content: `
        <h3>1. Trustee Roles and Scopes</h3>
        <p>Trustees do not have perpetual access to view vault contents during normal operations. A trustee is an authorized cryptographic key-holder whose role is strictly limited to releasing fragments under authorized circumstances.</p>
        
        <div class="article-reader-callout">
          <strong>Zero Knowledge:</strong> A trustee cannot inspect balances, credentials, or documents prior to release consensus.
        </div>

        <h3>2. Updating Trustee Access</h3>
        <p>Vault owners can update trustee appointments, designate alternates, or revoke appointments at any time from the <strong>Assigned Vaults</strong> panel before a release is initiated.</p>

        <h3>3. Handling Inactive or Unresponsive Trustees</h3>
        <p>If an appointed trustee loses access or fails to respond, alternate fallback trustees can be designated to ensure family access without compromising quorum integrity.</p>
      `
    }
  };

  // Topic Categories Data Store
  const topicsData = {
    'getting-started': {
      title: 'Getting Started Guide',
      articles: [
        { id: 'first-vault', title: 'Setting Up Your First Vault', time: '5 min read' },
        { id: 'gs-trustee-role', title: 'What is a Trustee and What are My Responsibilities?', time: '4 min read' },
        { id: 'gs-hardware-key', title: 'Setting Up Your FIDO2 Hardware Key or Biometrics', time: '3 min read' },
        { id: 'gs-verification', title: 'Complete Guide to Level 2 Identity Verification', time: '6 min read' }
      ]
    },
    'vault-management': {
      title: 'Vault Management Guide',
      articles: [
        { id: 'first-vault', title: 'Setting Up Your First Vault', time: '5 min read' },
        { id: 'vm-quorum', title: 'Choosing the Right M-of-N Quorum Threshold', time: '4 min read' },
        { id: 'vm-beneficiary', title: 'Adding and Managing Designated Beneficiaries', time: '3 min read' },
        { id: 'vm-deadman', title: 'Configuring Inactivity Timers & Dead Man Switches', time: '5 min read' }
      ]
    },
    'trustees-invites': {
      title: 'Trustees & Invitations',
      articles: [
        { id: 'trustee-permissions', title: 'Managing Trustee Permissions', time: '4 min read' },
        { id: 'ti-accepting', title: 'How to Accept or Decline a Trustee Appointment', time: '3 min read' },
        { id: 'ti-replace', title: 'Appointing Alternate Trustees for Quorum Redundancy', time: '4 min read' },
        { id: 'ti-conflicts', title: 'Trustee Fiduciary Duty and Legal Disclosures', time: '5 min read' }
      ]
    },
    'share-release': {
      title: 'Share Submission & Release Protocol',
      articles: [
        { id: 'release-process', title: 'Understanding the Release Process', time: '3 min read' },
        { id: 'sr-submitting', title: 'Step-by-Step Guide to Submitting Your Share Fragment', time: '4 min read' },
        { id: 'sr-grace-period', title: 'Understanding the 72-Hour Release Grace Period', time: '3 min read' },
        { id: 'sr-consensus', title: 'Cryptographic Proof Receipts & Audit Ledgers', time: '5 min read' }
      ]
    },
    'security-privacy': {
      title: 'Security & Privacy Standards',
      articles: [
        { id: 'sp-shamir', title: 'How Shamir’s Secret Sharing (SSSS) Protects You', time: '6 min read' },
        { id: 'sp-zero-knowledge', title: 'Why AegisVault Cannot Access Your Unencrypted Data', time: '4 min read' },
        { id: 'sp-emergency-freeze', title: 'How to Initiate an Emergency Account Freeze', time: '3 min read' },
        { id: 'sp-hardware-keys', title: 'Why WebAuthn FIDO2 Keys Prevent Phishing', time: '5 min read' }
      ]
    },
    'account-settings': {
      title: 'Account Settings & Preferences',
      articles: [
        { id: 'as-passphrase', title: 'Updating Your Master Account Passphrase', time: '3 min read' },
        { id: 'as-sessions', title: 'Auditing Active Trustee Sessions & Revocation', time: '3 min read' },
        { id: 'as-notifications', title: 'Configuring Real-Time High-Priority SMS & Email Alerts', time: '2 min read' },
        { id: 'as-recovery-codes', title: 'Generating and Storing Emergency Recovery Codes', time: '4 min read' }
      ]
    }
  };

  // Additional FAQs for Extended Modal
  const extendedFaqs = [
    {
      q: 'How do I add a trustee to my vault?',
      a: 'To appoint a trustee, go to Assigned Vaults, open the vault configuration, and select “Appoint Trustee”. Provide their legal name and verified email. They will receive an appointment invitation with an encrypted onboarding link.'
    },
    {
      q: 'How long does the release process take?',
      a: 'Once a vault release is initiated, appointed trustees have a grace period window (default 48 to 72 hours) to submit cryptographic fragments. As soon as the designated Shamir quorum threshold (e.g., 2 of 3) is submitted, institutional validation completes within 15 minutes.'
    },
    {
      q: 'Can I update a submitted share request?',
      a: 'Submitted shares are cryptographically committed to the consensus queue. If you made an error or suspect security compromise, you must initiate an emergency freeze in Profile & Security or alert support immediately to nullify the pending ticket.'
    },
    {
      q: 'What happens if a trustee declines?',
      a: 'If an appointed trustee declines an invitation or release petition, the vault owner is immediately notified. If a secondary or alternate trustee is configured in the vault policy, the prompt automatically falls back to them.'
    },
    {
      q: 'How do I reset my password?',
      a: 'Navigate to Profile & Security. In the “Change Master Passphrase” panel, verify your current passphrase and registered FIDO2 hardware security key before establishing a new master secret.'
    },
    {
      q: 'Is my data encrypted and secure?',
      a: 'Yes. AegisVault operates on a zero-knowledge architecture. All vault assets are split into cryptographic shares using Shamir\'s Secret Sharing (SSSS) and encrypted client-side using AES-256-GCM.'
    },
    {
      q: 'Can I serve as a trustee for multiple vaults?',
      a: 'Yes. Your verified trustee identity can be appointed to multiple independent vaults across different owners. Each vault maintains isolated cryptographic keys and permission thresholds.'
    },
    {
      q: 'What happens if I lose my FIDO2 hardware key?',
      a: 'If you lose your hardware authenticator, you can authenticate using your offline emergency recovery codes (generated during onboarding) and immediately register a replacement key in Profile & Security.'
    },
    {
      q: 'Are trustee actions publicly logged?',
      a: 'All trustee interactions (invitation responses, identity verifications, share submissions, and release votes) are permanently recorded to an immutable cryptographic audit ledger viewable in Activity & History.'
    },
    {
      q: 'How do I export my trustee audit trail?',
      a: 'Navigate to Activity & History and click the “Export Full Audit CSV” button in the right sidebar. A timestamped cryptographic ledger will download instantly to your device.'
    }
  ];

  // 1. Accordion Toggle Behavior
  const faqItems = document.querySelectorAll('.popular-questions-card .faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other accordions in the same list
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });

  // 2. Open Article Reader Modal
  function openArticleReader(articleKey) {
    const data = articlesData[articleKey] || {
      category: 'GENERAL ARTICLE',
      readTime: '4 min read',
      title: 'AegisVault Trustee Documentation',
      content: `
        <h3>Help & Documentation</h3>
        <p>This article provides official reference instructions for trustees and vault guardians. For specific assistance, please contact our support team using the form on this page.</p>
      `
    };

    document.getElementById('modalArticleBadge').textContent = `${data.category} • ${data.readTime}`;
    document.getElementById('modalArticleTitle').textContent = data.title;
    document.getElementById('modalArticleContent').innerHTML = data.content;

    // Reset feedback buttons
    const btnYes = document.getElementById('btnHelpfulYes');
    const btnNo = document.getElementById('btnHelpfulNo');
    if (btnYes && btnNo) {
      btnYes.disabled = false;
      btnNo.disabled = false;
      btnYes.textContent = '👍 Yes';
      btnNo.textContent = '👎 No';
    }

    if (window.openModal) {
      window.openModal('articleReaderModal');
    }
  }

  // Article Cards Click Handlers
  document.querySelectorAll('.article-card').forEach(card => {
    card.addEventListener('click', () => {
      const articleId = card.getAttribute('data-article');
      openArticleReader(articleId);
    });
  });

  // Helpful Feedback Buttons
  const btnHelpfulYes = document.getElementById('btnHelpfulYes');
  const btnHelpfulNo = document.getElementById('btnHelpfulNo');
  if (btnHelpfulYes && btnHelpfulNo) {
    btnHelpfulYes.addEventListener('click', () => {
      btnHelpfulYes.textContent = '✓ Thank you!';
      btnHelpfulYes.disabled = true;
      btnHelpfulNo.disabled = true;
      if (window.showToast) window.showToast('Feedback submitted. Thank you for helping us improve!', 'success');
    });

    btnHelpfulNo.addEventListener('click', () => {
      btnHelpfulNo.textContent = 'Feedback noted';
      btnHelpfulYes.disabled = true;
      btnHelpfulNo.disabled = true;
      if (window.showToast) window.showToast('Thank you for your feedback. We will refine this guide.', 'info');
    });
  }

  // 3. Browse Help Topics Click Handlers
  document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', () => {
      const topicKey = card.getAttribute('data-topic');
      const topic = topicsData[topicKey];
      if (!topic) return;

      let html = `<p style="margin-bottom:16px;">Curated guides and documentation for <strong>${topic.title}</strong>:</p><div style="display:flex; flex-direction:column; gap:10px;">`;
      topic.articles.forEach(art => {
        html += `
          <div style="background:var(--surface-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:12px 16px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.readTopicArticle('${art.id}')">
            <div>
              <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">${art.title}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${art.time}</div>
            </div>
            <span style="font-size:0.8rem; font-weight:600; color:#3b82f6;">Read →</span>
          </div>
        `;
      });
      html += `</div>`;

      document.getElementById('modalArticleBadge').textContent = 'TOPIC COLLECTION';
      document.getElementById('modalArticleTitle').textContent = topic.title;
      document.getElementById('modalArticleContent').innerHTML = html;

      if (window.openModal) {
        window.openModal('articleReaderModal');
      }
    });
  });

  // Global helper to switch to specific article from topic list
  window.readTopicArticle = function(id) {
    openArticleReader(id);
  };

  // 4. View All Articles Link
  const viewAllArticlesBtn = document.getElementById('viewAllArticlesBtn');
  if (viewAllArticlesBtn) {
    viewAllArticlesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let allHtml = `<div style="display:flex; flex-direction:column; gap:18px;">`;
      
      Object.keys(topicsData).forEach(key => {
        const topic = topicsData[key];
        allHtml += `
          <div>
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary-500); margin-bottom:8px;">${topic.title}</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
        `;
        topic.articles.forEach(art => {
          allHtml += `
            <div style="background:var(--surface-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.readTopicArticle('${art.id}')">
              <span style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">${art.title}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${art.time}</span>
            </div>
          `;
        });
        allHtml += `</div></div>`;
      });

      allHtml += `</div>`;

      document.getElementById('modalArticleBadge').textContent = 'KNOWLEDGE BASE DIRECTORY';
      document.getElementById('modalArticleTitle').textContent = 'All Documentation & Articles';
      document.getElementById('modalArticleContent').innerHTML = allHtml;

      if (window.openModal) {
        window.openModal('articleReaderModal');
      }
    });
  }

  // 5. View All FAQ Modal Handler
  const viewAllFaqBtn = document.getElementById('viewAllFaqBtn');
  if (viewAllFaqBtn) {
    viewAllFaqBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const listEl = document.getElementById('extendedFaqList');
      if (listEl) {
        listEl.innerHTML = '';
        extendedFaqs.forEach((faq, index) => {
          const item = document.createElement('div');
          item.className = 'faq-item';
          item.innerHTML = `
            <button class="faq-question-btn" type="button">
              <span>${faq.q}</span>
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="faq-answer-content">
              <div class="faq-answer-body">${faq.a}</div>
            </div>
          `;
          const btn = item.querySelector('.faq-question-btn');
          btn.addEventListener('click', () => {
            item.classList.toggle('active');
          });
          listEl.appendChild(item);
        });
      }

      if (window.openModal) {
        window.openModal('allQuestionsModal');
      }
    });
  }

  // 6. Search Functionality
  const searchInput = document.getElementById('helpSearchInput');
  const searchBtn = document.getElementById('helpSearchBtn');
  const searchTags = document.querySelectorAll('.help-search-tag');

  function performSearch(query) {
    if (!query || !query.trim()) {
      if (window.showToast) window.showToast('Please enter a search term', 'info');
      return;
    }
    const term = query.trim().toLowerCase();

    // Check FAQ items
    let matchedFaq = false;
    faqItems.forEach(item => {
      const qText = item.querySelector('.faq-question-btn span').textContent.toLowerCase();
      const aText = item.querySelector('.faq-answer-body').textContent.toLowerCase();
      if (qText.includes(term) || aText.includes(term)) {
        item.classList.add('active');
        matchedFaq = true;
      } else {
        item.classList.remove('active');
      }
    });

    // Check Article cards
    let matchedArticles = 0;
    document.querySelectorAll('.article-card').forEach(card => {
      const title = card.querySelector('.article-title').textContent.toLowerCase();
      const summary = card.querySelector('.article-summary').textContent.toLowerCase();
      if (title.includes(term) || summary.includes(term)) {
        card.style.borderColor = 'var(--primary-500)';
        matchedArticles++;
      } else {
        card.style.borderColor = '';
      }
    });

    if (window.showToast) {
      window.showToast(`Found search results for “${query}”`, 'success');
    }

    if (matchedFaq) {
      document.querySelector('.popular-questions-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      }
    });
  }

  searchTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const q = tag.getAttribute('data-query');
      if (searchInput) searchInput.value = q;
      performSearch(q);
    });
  });

  // 7. Contact Support Form Submission
  const contactForm = document.getElementById('contactSupportForm');
  const submitSupportBtn = document.getElementById('submitSupportBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const subject = document.getElementById('supportSubject').value;
      const message = document.getElementById('supportMessage').value.trim();

      if (!subject) {
        if (window.showToast) window.showToast('Please select a support subject', 'warning');
        return;
      }

      if (!message || message.length < 10) {
        if (window.showToast) window.showToast('Please provide a message with at least 10 characters', 'warning');
        return;
      }

      // Show loading state
      const origContent = submitSupportBtn.innerHTML;
      submitSupportBtn.disabled = true;
      submitSupportBtn.innerHTML = `
        <svg class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
        <span>Transmitting Ticket...</span>
      `;

      setTimeout(() => {
        submitSupportBtn.disabled = false;
        submitSupportBtn.innerHTML = origContent;

        // Generate dynamic ticket ID
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const ticketId = `#TKT-${randomNum}`;
        document.getElementById('modalTicketId').textContent = ticketId;

        // Reset form
        contactForm.reset();

        // Open Confirmation Modal
        if (window.openModal) {
          window.openModal('ticketConfirmModal');
        }

        if (window.showToast) {
          window.showToast(`Support ticket ${ticketId} generated successfully.`, 'success');
        }
      }, 1000);
    });
  }

  // 8. Copy Ticket ID Button
  const btnCopyTicket = document.getElementById('btnCopyTicket');
  if (btnCopyTicket) {
    btnCopyTicket.addEventListener('click', () => {
      const ticketId = document.getElementById('modalTicketId').textContent;
      navigator.clipboard.writeText(ticketId).then(() => {
        if (window.showToast) window.showToast(`Copied ${ticketId} to clipboard!`, 'info');
      }).catch(() => {
        if (window.showToast) window.showToast('Copied ticket ID to clipboard!', 'info');
      });
    });
  }
});
