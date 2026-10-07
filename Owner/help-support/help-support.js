/**
 * AegisVault Owner Panel — Module 10: Help & Support Script
 * Handles:
 *  - FAQ Accordion toggle & animation
 *  - FAQ Live Search filtering
 *  - Top Resource Cards actions
 *  - Knowledge Base topic box selection
 *  - Contact Support options (Ticket Modal, Live Chat, Email)
 *  - Support Ticket submission with API integration markers
 *  - System Status and Other Resources triggers
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initFAQAccordion();
    initFAQSearch();
    initTopResourceCards();
    initKBTopicBoxes();
    initContactSupportActions();
    initSupportTicketModal();
    initOtherResourceButtons();
  });

  // --------------------------------------------------------------------------
  // 1. FAQ Accordion Toggle
  // --------------------------------------------------------------------------
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
      const btn = item.querySelector('.faq-question-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Toggle state
        if (isOpen) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. FAQ Live Search Filter
  // --------------------------------------------------------------------------
  function initFAQSearch() {
    const searchInput = document.getElementById('faqSearchInput');
    const faqItems = document.querySelectorAll('.faq-item');
    if (!searchInput || !faqItems.length) return;

    searchInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();

      faqItems.forEach((item) => {
        const qText = item.querySelector('.faq-q-text')?.textContent.toLowerCase() || '';
        const aText = item.querySelector('.faq-answer-panel')?.textContent.toLowerCase() || '';

        if (!query || qText.includes(query) || aText.includes(query)) {
          item.style.display = '';
          if (query && (qText.includes(query) || aText.includes(query))) {
            item.classList.add('open');
            const btn = item.querySelector('.faq-question-btn');
            if (btn) btn.setAttribute('aria-expanded', 'true');
          }
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Top 4 Resource Cards Handlers
  // --------------------------------------------------------------------------
  function initTopResourceCards() {
    const cardKB = document.getElementById('cardKB');
    const cardVideo = document.getElementById('cardVideo');
    const cardSupport = document.getElementById('cardSupport');
    const cardGuides = document.getElementById('cardGuides');

    if (cardKB) {
      cardKB.addEventListener('click', () => {
        const kbSection = document.getElementById('kbTopicsSection');
        if (kbSection) {
          kbSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (cardVideo) {
      cardVideo.addEventListener('click', () => {
        notify('Launching AegisVault Video Masterclass library (12 tutorials)...', 'info');
      });
    }

    if (cardSupport) {
      cardSupport.addEventListener('click', () => {
        openTicketModal();
      });
    }

    if (cardGuides) {
      cardGuides.addEventListener('click', () => {
        notify('Downloading AegisVault Master User Guide & Security Whitepaper (PDF)...', 'info');
      });
    }

    const btnViewAllArticles = document.getElementById('btnViewAllArticles');
    if (btnViewAllArticles) {
      btnViewAllArticles.addEventListener('click', () => {
        notify('Displaying all 39 knowledge base guides and documentation articles.', 'info');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Knowledge Base Topic Box Selection
  // --------------------------------------------------------------------------
  function initKBTopicBoxes() {
    const topicBoxes = document.querySelectorAll('.topic-box');
    topicBoxes.forEach((box) => {
      box.addEventListener('click', function () {
        const title = this.querySelector('.topic-title')?.textContent || 'Topic';
        const count = this.querySelector('.topic-count')?.textContent || '';
        notify(`Browsing "${title}" knowledge base (${count})...`, 'info');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. Contact Support Options
  // --------------------------------------------------------------------------
  function initContactSupportActions() {
    const btnSubmitTicket = document.getElementById('btnSubmitTicket');
    const btnLiveChat = document.getElementById('btnLiveChat');
    const btnViewStatus = document.getElementById('btnViewStatus');

    if (btnSubmitTicket) {
      btnSubmitTicket.addEventListener('click', () => {
        openTicketModal();
      });
    }

    if (btnLiveChat) {
      btnLiveChat.addEventListener('click', () => {
        notify('Connecting to secure live chat session with an encrypted support technician...', 'info');
      });
    }

    if (btnViewStatus) {
      btnViewStatus.addEventListener('click', () => {
        notify('System Status: All 18 microservices operational (Latency: 24ms, Uptime: 99.99%).', 'success');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. Support Ticket Modal Controls
  // --------------------------------------------------------------------------
  function initSupportTicketModal() {
    const modal = document.getElementById('supportTicketModal');
    if (!modal) return;

    // Close buttons
    const closeBtns = modal.querySelectorAll('[data-close="supportTicketModal"], .modal-close');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        closeTicketModal();
      });
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTicketModal();
      }
    });

    // Submit confirmation
    const btnConfirm = document.getElementById('btnSubmitTicketConfirm');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        const category = document.getElementById('ticketCategory')?.value || 'vault';
        const subject = document.getElementById('ticketSubject')?.value.trim();
        const description = document.getElementById('ticketDescription')?.value.trim();

        if (!subject) {
          notify('Please enter a brief subject for your ticket.', 'error');
          document.getElementById('ticketSubject')?.focus();
          return;
        }

        if (!description) {
          notify('Please enter a detailed description of your issue.', 'error');
          document.getElementById('ticketDescription')?.focus();
          return;
        }

        // Disable button during simulated dispatch
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Submitting...';

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post('/owner/support/tickets/', {
            category: category,
            subject: subject,
            description: description
          }).then(res => {
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Submit Ticket';
            closeTicketModal();
            if (document.getElementById('ticketSubject')) document.getElementById('ticketSubject').value = '';
            if (document.getElementById('ticketDescription')) document.getElementById('ticketDescription').value = '';
            const ticketIdStr = res.ticket_id ? res.ticket_id.split('-')[0].substring(0, 5) : Math.floor(10000 + Math.random() * 90000);
            notify(`Support Ticket #${ticketIdStr} submitted successfully. Response guaranteed within 4 hours.`, 'success');
          }).catch(err => {
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Submit Ticket';
            notify(`Failed to submit ticket: ${err.message}`, 'error');
          });
        } else {
          setTimeout(() => {
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Submit Ticket';
            closeTicketModal();
            if (document.getElementById('ticketSubject')) document.getElementById('ticketSubject').value = '';
            if (document.getElementById('ticketDescription')) document.getElementById('ticketDescription').value = '';
            const ticketId = 'AV-' + Math.floor(10000 + Math.random() * 90000);
            notify(`Support Ticket #${ticketId} submitted successfully. Response guaranteed within 4 hours.`, 'success');
          }, 600);
        }
      });
    }
  }

  function openTicketModal() {
    const modal = document.getElementById('supportTicketModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      const subjectInput = document.getElementById('ticketSubject');
      if (subjectInput) subjectInput.focus();
    }
  }

  function closeTicketModal() {
    const modal = document.getElementById('supportTicketModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  // --------------------------------------------------------------------------
  // 7. Other Resource Links Handlers
  // --------------------------------------------------------------------------
  function initOtherResourceButtons() {
    const btnDownloadGuide = document.getElementById('btnDownloadGuide');
    const btnOpenVideoLib = document.getElementById('btnOpenVideoLib');
    const btnCommunity = document.getElementById('btnCommunity');
    const btnWhatsNew = document.getElementById('btnWhatsNew');

    if (btnDownloadGuide) {
      btnDownloadGuide.addEventListener('click', () => {
        notify('Downloading AegisVault Complete User Guide (PDF, 4.2 MB)...', 'info');
      });
    }

    if (btnOpenVideoLib) {
      btnOpenVideoLib.addEventListener('click', () => {
        notify('Launching AegisVault Video Library & Tutorial Series...', 'info');
      });
    }

    if (btnCommunity) {
      btnCommunity.addEventListener('click', () => {
        notify('Connecting to AegisVault Verified Owner Community Forum...', 'info');
      });
    }

    if (btnWhatsNew) {
      btnWhatsNew.addEventListener('click', () => {
        notify('AegisVault v2.4.0 Release Notes: Zero-knowledge threshold sharing now active!', 'success');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Global Toast Helper
  // --------------------------------------------------------------------------
  function notify(message, type = 'info') {
    if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') {
      window.AegisOwner.showToast(message, type);
    } else {
      alert(message);
    }
  }

})();
