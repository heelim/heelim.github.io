document.addEventListener('DOMContentLoaded', () => {
    function showTab(tabId) {
        if (!tabId) return;

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(l => {
            if (l.getAttribute('data-tab') === tabId) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab.id === tabId) {
                tab.classList.remove('hidden');
            } else {
                tab.classList.add('hidden');
            }
        });
    }

    // Tab switching logic
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            window.location.hash = tabId;
        });
    });

    // Handle initial hash and changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) showTab(hash);
    });

    // Initial load
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        showTab(initialHash);
    }

    const cfpList = document.getElementById('cfp-list');
    const sortFieldSelect = document.getElementById('sort-field');
    const sortOrderSelect = document.getElementById('sort-order');
    const keywordContainer = document.getElementById('keyword-container');
    const domainContainer = document.getElementById('domain-container');

    let allCfps = [];
    let confInfo = {};
    let selectedKeywords = new Set();
    let selectedDomains = new Set();
    let showPast = false;
    const today = new Date();

    async function loadData() {
        try {
            const [cfpRes, infoRes] = await Promise.all([
                fetch('cfp.json'),
                fetch('conf_info.json')
            ]);
            allCfps = await cfpRes.json();
            confInfo = await infoRes.json();

            renderFilters();
            renderCfps();
            setupToggle();
        } catch (error) {
            console.error('Error loading data:', error);
            cfpList.innerHTML = '<p style="color: #f87171;">Failed to load data.</p>';
        }
    }

    function setupToggle() {
        const toggles = [
            { btnId: 'domain-toggle', wrapperId: 'domain-collapsible', iconId: 'domain-icon', activeBg: 'rgba(16, 185, 129, 0.2)', inactiveBg: 'rgba(16, 185, 129, 0.1)' },
            { btnId: 'keyword-toggle', wrapperId: 'keyword-collapsible', iconId: 'keyword-icon', activeBg: 'rgba(59, 130, 246, 0.2)', inactiveBg: 'rgba(59, 130, 246, 0.1)' },
            { btnId: 'past-toggle', iconId: 'past-icon', activeBg: 'rgba(148, 163, 184, 0.2)', inactiveBg: 'rgba(148, 163, 184, 0.1)' }
        ];

        toggles.forEach(t => {
            const toggleBtn = document.getElementById(t.btnId);
            const wrapper = t.wrapperId ? document.getElementById(t.wrapperId) : null;
            const icon = document.getElementById(t.iconId);

            if (toggleBtn && icon) {
                toggleBtn.addEventListener('click', () => {
                    let isExpanded;
                    if (wrapper) {
                        isExpanded = wrapper.classList.toggle('expanded');
                    } else if (t.btnId === 'past-toggle') {
                        showPast = !showPast;
                        isExpanded = showPast;
                        renderCfps();
                    }
                    icon.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
                    toggleBtn.style.background = isExpanded ? t.activeBg : t.inactiveBg;
                });
            }
        });
    }

    function renderFilters() {
        const allKeywords = new Set();
        const allDomains = new Set();
        Object.values(confInfo).forEach(info => {
            if (info.keywords) info.keywords.forEach(kw => allKeywords.add(kw));
            if (info.domains) info.domains.forEach(dom => allDomains.add(dom));
        });

        // Render Domains
        const sortedDomains = Array.from(allDomains).sort();
        domainContainer.innerHTML = sortedDomains.map(dom => `
            <label class="filter-chip">
                <input type="checkbox" class="domain-input" value="${dom}">
                ${dom}
            </label>
        `).join('');

        // Render Keywords
        const sortedKeywords = Array.from(allKeywords).sort();
        keywordContainer.innerHTML = sortedKeywords.map(kw => `
            <label class="filter-chip">
                <input type="checkbox" class="keyword-input" value="${kw}">
                ${kw}
            </label>
        `).join('');

        // Listeners for Domains
        domainContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const dom = e.target.value;
                if (e.target.checked) {
                    selectedDomains.add(dom);
                    e.target.parentElement.classList.add('domain-active');
                } else {
                    selectedDomains.delete(dom);
                    e.target.parentElement.classList.remove('domain-active');
                }
                renderCfps();
            });
        });

        // Listeners for Keywords
        keywordContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const kw = e.target.value;
                if (e.target.checked) {
                    selectedKeywords.add(kw);
                    e.target.parentElement.classList.add('active');
                } else {
                    selectedKeywords.delete(kw);
                    e.target.parentElement.classList.remove('active');
                }
                renderCfps();
            });
        });
    }

    function parseDate(dateStr) {
        if (!dateStr || dateStr.trim() === "") return new Date(9999, 11, 31);

        // Handle YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return new Date(dateStr);
        }

        // Handle Month YYYY (e.g., "March 2026")
        const monthYearMatch = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
        if (monthYearMatch) {
            const monthName = monthYearMatch[1];
            const year = monthYearMatch[2];
            return new Date(`${monthName} 1, ${year}`);
        }

        // Fallback to native Date parsing
        const parsed = new Date(dateStr);
        return isNaN(parsed) ? new Date(9999, 11, 31) : parsed;
    }

    function renderCfps() {
        const field = sortFieldSelect.value;
        const order = sortOrderSelect.value;

        // 1. Initial Filtering (Upcoming vs. Past)
        let filteredCfps = allCfps.filter(cfp => {
            const deadlineDate = parseDate(cfp.deadline);
            if (showPast) return true;
            return deadlineDate >= today;
        });

        // 2. Multi-category Filtering (Domain OR Keyword)
        if (selectedKeywords.size > 0 || selectedDomains.size > 0) {
            filteredCfps = filteredCfps.filter(cfp => {
                const info = confInfo[cfp.venue];
                if (!info) return false;

                const matchesDomain = info.domains && info.domains.some(dom => selectedDomains.has(dom));
                const matchesKeyword = info.keywords && info.keywords.some(kw => selectedKeywords.has(kw));

                return matchesDomain || matchesKeyword;
            });
        }

        // 3. Sorting
        filteredCfps.sort((a, b) => {
            let valA, valB;

            if (field === 'venue') {
                valA = a.venue;
                valB = b.venue;
                const comparison = valA.localeCompare(valB);
                return order === 'asc' ? comparison : -comparison;
            } else {
                // Use parseDate for deadline, start_date, and notification
                valA = parseDate(a[field]);
                valB = parseDate(b[field]);
                const comparison = valA - valB;
                return order === 'asc' ? comparison : -comparison;
            }
        });

        if (field === 'bk21plus') {
            filteredCfps.sort((a, b) => {
                const infoA = confInfo[a.venue] || {};
                const infoB = confInfo[b.venue] || {};
                const scoreA = parseInt(infoA.bk21plus) || 0;
                const scoreB = parseInt(infoB.bk21plus) || 0;

                if (scoreA === 0 && scoreB === 0) return 0;
                if (scoreA === 0) return 1;
                if (scoreB === 0) return -1;

                return order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
            });
        }

        if (filteredCfps.length === 0) {
            cfpList.innerHTML = '<p style="color: #64748b;">No matching conferences found.</p>';
            return;
        }

        cfpList.innerHTML = filteredCfps.map(cfp => {
            const deadlineDate = new Date(cfp.deadline);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dDayText = diffDays === 0 ? 'D-Day' : (diffDays < 0 ? `D+${Math.abs(diffDays)}` : `D-${diffDays}`);

            const info = confInfo[cfp.venue];
            const domainTags = info && info.domains ? info.domains.map(dom => `
                <span style="font-size: 0.75rem; color: #10b981; font-weight: 600; margin-right: 0.5rem; text-transform: uppercase;">#${dom}</span>
            `).join('') : '';

            const rankingBadges = info && (info.bk21plus || info.kiise) ? `
                <div style="margin-top: 6px; display: flex; gap: 0.5rem; align-items: center;">
                    ${info.bk21plus ? `<span style="font-size: 0.7rem; padding: 0.15rem 0.5rem; background: rgba(16, 185, 129, 0.15); color: #10b981; border-radius: 4px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.2);">BK21+ ${info.bk21plus}</span>` : ''}
                    ${info.kiise ? `<span style="font-size: 0.7rem; padding: 0.15rem 0.5rem; background: rgba(59, 130, 246, 0.15); color: var(--accent); border-radius: 4px; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.2);">KIISE ${info.kiise}</span>` : ''}
                </div>
            ` : '';

            const keywordsHtml = info && info.keywords ? `
                <div style="display: flex; gap: 0.4rem; margin-top: 0.6rem; flex-wrap: wrap;">
                    ${info.keywords.map(kw => `<span style="font-size: 0.75rem; padding: 0.1rem 0.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 4px; color: #64748b; border: 1px solid rgba(255, 255, 255, 0.05);">${kw}</span>`).join('')}
                </div>
            ` : '';

            const isPast = deadlineDate < today;
            const opacity = isPast ? '0.5' : '1';
            const grayscale = isPast ? 'grayscale(100%)' : 'none';

            return `
        <div class="pub-item" style="margin-bottom: 0.5rem; padding: 1.2rem; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); opacity: ${opacity}; filter: ${grayscale};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <span class="item-title" style="font-weight: 600;">
              ${cfp.url ? `<a href="${cfp.url}" target="_blank" style="color: var(--accent); text-decoration: none;">${cfp.venue} ${cfp.year}</a>` : `<span style="color: var(--accent);">${cfp.venue} ${cfp.year}</span>`} 
              ${cfp.subtitle ? `<span style="color: #94a3b8; font-weight: 400; font-size: 0.9em;">(${cfp.subtitle})</span>` : ''}
              <div style="margin-top: 4px; display: flex; flex-wrap: wrap;">${domainTags}</div>
              ${rankingBadges}
            </span>
            <span style="font-size: 0.875rem; padding: 0.25rem 0.75rem; background: rgba(59, 130, 246, 0.1); color: var(--accent); border-radius: 20px; font-weight: 700; min-width: 60px; text-align: center;">
              ${dDayText}
            </span>
          </div>
          <div style="font-size: 0.95rem; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
            <span style="color: var(--fg); font-weight: 500;">Deadline: <span style="color: #f87171;">${cfp.deadline}</span></span>
            ${cfp.notification ? `<span style="opacity: 0.3;">|</span><span>Notification: <span style="color: #fbbf24;">${cfp.notification}</span></span>` : ''}
            <span style="opacity: 0.3;">|</span>
            <span>Dates: ${cfp.date}</span>
            <span style="opacity: 0.3;">|</span>
            <span>Location: ${cfp.location}</span>
          </div>
          ${keywordsHtml}
        </div>
      `;
        }).join('');
    }

    sortFieldSelect.addEventListener('change', renderCfps);
    sortOrderSelect.addEventListener('change', renderCfps);

    loadData();
});
