document.addEventListener('DOMContentLoaded', () => {
    const cfpList = document.getElementById('journal-list');
    const keywordContainer = document.getElementById('journal-keyword-container');
    const domainContainer = document.getElementById('journal-domain-container');

    let allCfps = [];
    let confInfo = {};
    let confOrder = [];
    let selectedKeywords = new Set();
    let selectedDomains = new Set();
    let sortBy = 'default';
    let sortOrder = 'asc';
    
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    async function loadData() {
        try {
            const [cfpRes, infoRes, orderRes, updatedRes] = await Promise.all([
                fetch('journal_cfp.json'),
                fetch('journal_info.json'),
                fetch('journal_order.json').catch(() => null),
                fetch('last.updated').catch(() => null)
            ]);
            const rawCfps = await cfpRes.json();
            allCfps = [];
            for (const [venue, venueData] of Object.entries(rawCfps)) {
                const sharedUrl = typeof venueData.url === 'string' ? venueData.url : "";
                
                for (const [key, value] of Object.entries(venueData)) {
                    // Skip string parameters (like url)
                    if (typeof value !== 'object' || value === null) {
                        continue;
                    }
                    
                    const subtitle = key;
                    const entry = value;
                    
                    // Determine year
                    let entryYear = today.getFullYear();
                    const parseYr = (dStr) => {
                        if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
                            return parseInt(dStr.split('-')[0]);
                        }
                        return null;
                    };
                    const yrFromDl = parseYr(entry.deadline) || parseYr(entry.abstract_deadline) || parseYr(entry.notification);
                    if (yrFromDl) {
                        entryYear = yrFromDl;
                    }
                    
                    allCfps.push({
                        venue,
                        year: entryYear,
                        subtitle: subtitle === "General Submissions" || subtitle === "none" ? "" : subtitle,
                        date: "",
                        start_date: "",
                        finish_date: "",
                        url: entry.url !== undefined ? entry.url : sharedUrl,
                        location: "",
                        deadline: entry.deadline || "",
                        abstract_deadline: entry.abstract_deadline || "",
                        early_notification: entry.early_notification || "",
                        notification: entry.notification || "",
                        is_verified: entry.is_verified || false
                    });
                }
            }
            confInfo = await infoRes.json();
            if (orderRes && orderRes.ok) {
                confOrder = await orderRes.json();
            }
            if (confOrder && confOrder.length > 0) {
                const confOrderSet = new Set(confOrder);
                allCfps = allCfps.filter(cfp => confOrderSet.has(cfp.venue));
            }
            
            if (updatedRes && updatedRes.ok) {
                const dateStr = await updatedRes.text();
                const cleanDate = dateStr.trim();
                const el1 = document.getElementById('journal-last-updated');
                if (el1) el1.innerText = `Last updated: ${cleanDate}`;
            }

            renderFilters();
            renderCfps();
            setupToggle();
        } catch (error) {
            console.error('Error loading data:', error);
            cfpList.innerHTML = '<p style="color: #f87171;">Failed to load journal data.</p>';
        }
    }

    function setupToggle() {
        const toggles = [
            { btnId: 'journal-domain-toggle', wrapperId: 'journal-domain-collapsible', iconId: 'journal-domain-icon', activeBg: 'rgba(16, 185, 129, 0.2)', inactiveBg: 'rgba(16, 185, 129, 0.1)' },
            { btnId: 'journal-keyword-toggle', wrapperId: 'journal-keyword-collapsible', iconId: 'journal-keyword-icon', activeBg: 'rgba(59, 130, 246, 0.2)', inactiveBg: 'rgba(59, 130, 246, 0.1)' }
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
        const visibleVenues = new Set(allCfps.map(cfp => cfp.venue));

        visibleVenues.forEach(venue => {
            const info = confInfo[venue];
            if (info) {
                if (info.keywords) info.keywords.forEach(kw => allKeywords.add(kw));
                if (info.domains) info.domains.forEach(dom => allDomains.add(dom));
            }
        });

        // Render Domains
        const sortedDomains = Array.from(allDomains).sort();
        const domainsHtml = sortedDomains.map(dom => `
            <label class="filter-chip">
                <input type="checkbox" class="domain-input" value="${dom}">
                ${dom}
            </label>
        `).join('');
        domainContainer.innerHTML = domainsHtml;

        // Render Keywords
        const sortedKeywords = Array.from(allKeywords).sort();
        const keywordsHtmlStr = sortedKeywords.map(kw => `
            <label class="filter-chip">
                <input type="checkbox" class="keyword-input" value="${kw}">
                ${kw}
            </label>
        `).join('');
        keywordContainer.innerHTML = keywordsHtmlStr;

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

    function isCfpDeadlinePassed(cfp) {
        const dl = cfp.deadline;
        if (!dl || dl === "TBD" || dl === "TBA" || dl.trim() === "") {
            return cfp.year < today.getFullYear();
        }
        const d = parseDate(dl);
        if (d.getFullYear() === 9999) {
            return cfp.year < today.getFullYear();
        }
        return d < todayStart;
    }

    function isCfpStartDatePassed(cfp) {
        const sd = cfp.start_date;
        if (!sd || sd === "TBD" || sd === "TBA" || sd.trim() === "") {
            return cfp.year < today.getFullYear();
        }
        const d = parseDate(sd);
        if (d.getFullYear() === 9999) {
            return cfp.year < today.getFullYear();
        }
        return d < todayStart;
    }

    function generateTableHtml(filteredCfps) {
        if (filteredCfps.length === 0) {
            return '<p style="color: #64748b; padding: 2rem; text-align: center;">No matching journals found.</p>';
        }

        const formatDateStr = (dateStr) => {
            if (!dateStr || dateStr.trim() === "") return '—';
            return dateStr;
        };

        const rowsHtml = filteredCfps.map(cfp => {
            const info = confInfo[cfp.venue] || {};
            const isPassed = isCfpDeadlinePassed(cfp);
            const rowClass = isPassed ? 'class="deadline-passed-row"' : '';
            
            const displayVenue = cfp.url 
                ? `<a href="${cfp.url}" target="_blank">${cfp.venue}</a>`
                : cfp.venue;
            const checkmark = cfp.is_verified 
                ? `<span class="gantt-badge-verified" title="Verified Information">✓</span>`
                : '';
                
            const q = info.quartile || '';
            const qBadge = q 
                ? `<span class="quartile-badge q-${q.toLowerCase()}">${q}</span>`
                : '—';
                
            const impactFactor = info.if || '—';
            
            const subtitle = cfp.subtitle || 'General Submissions';
            const trackText = cfp.subtitle
                ? (cfp.url ? `<a href="${cfp.url}" target="_blank" class="cfp-title-link">${subtitle}</a>` : `<span class="cfp-title-text">${subtitle}</span>`)
                : `<span class="cfp-title-text" style="color: #64748b; font-style: italic;">${subtitle}</span>`;
                
            const deadlineDate = cfp.deadline ? cfp.deadline : 'Ongoing';
            const deadlineClass = isPassed ? 'passed' : (deadlineDate !== 'Ongoing' && parseDate(deadlineDate) - todayStart < 7 * 24 * 60 * 60 * 1000 ? 'soon' : '');
            
            const notifDate = formatDateStr(cfp.notification);
            const notifClass = cfp.notification && parseDate(cfp.notification) < todayStart ? 'passed' : '';

            return `
                <tr ${rowClass}>
                    <td class="venue-link-cell">${displayVenue}${checkmark}</td>
                    <td class="col-if" style="font-weight: 500;">${impactFactor}</td>
                    <td class="col-q">${qBadge}</td>
                    <td>${trackText}</td>
                    <td class="date-cell ${deadlineClass}" style="font-weight: 500;">${deadlineDate}</td>
                    <td class="date-cell ${notifClass}">${notifDate}</td>
                </tr>
            `;
        }).join('');

        return `
            <table class="journal-table">
                <thead>
                    <tr>
                        <th class="col-venue ${sortBy === 'name' ? 'sorted-' + sortOrder : ''}" data-sort="name">Journal</th>
                        <th class="col-if ${sortBy === 'if' ? 'sorted-' + sortOrder : ''}" data-sort="if">IF</th>
                        <th class="col-q ${sortBy === 'quartile' ? 'sorted-' + sortOrder : ''}" data-sort="quartile">Q</th>
                        <th class="col-title ${sortBy === 'track' ? 'sorted-' + sortOrder : ''}" data-sort="track">Special Issue / Track</th>
                        <th class="col-deadline ${sortBy === 'deadline' ? 'sorted-' + sortOrder : ''}" data-sort="deadline">Submission Due</th>
                        <th class="col-notif ${sortBy === 'notification' ? 'sorted-' + sortOrder : ''}" data-sort="notification">Notification</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;
    }

    function setupTableHeaderClicks() {
        const headers = document.querySelectorAll('.journal-table th[data-sort]');
        headers.forEach(th => {
            th.addEventListener('click', () => {
                const targetSort = th.getAttribute('data-sort');
                if (sortBy === targetSort) {
                    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    sortBy = targetSort;
                    sortOrder = targetSort === 'if' ? 'desc' : 'asc';
                }
                
                // Sync select dropdown
                const sortBySelect = document.getElementById('journal-sort-by');
                if (sortBySelect) {
                    if (['name', 'if', 'quartile', 'deadline'].includes(sortBy)) {
                        sortBySelect.value = sortBy;
                    } else {
                        sortBySelect.value = 'default';
                    }
                }
                
                // Update sort-order button
                const orderIcon = document.getElementById('journal-order-icon');
                const orderText = document.getElementById('journal-order-text');
                if (orderIcon) orderIcon.innerText = sortOrder === 'asc' ? '▲' : '▼';
                if (orderText) orderText.innerText = sortOrder === 'asc' ? 'Asc' : 'Desc';
                
                updateSortOrderVisibility();
                renderCfps();
            });
        });
    }

    function renderCfps() {
        let filteredCfps = allCfps;

        // Multi-category Filtering (Domain OR Keyword)
        if (selectedKeywords.size > 0 || selectedDomains.size > 0) {
            filteredCfps = filteredCfps.filter(cfp => {
                const info = confInfo[cfp.venue];
                if (!info) return false;

                const matchesDomain = info.domains && info.domains.some(dom => selectedDomains.has(dom));
                const matchesKeyword = info.keywords && info.keywords.some(kw => selectedKeywords.has(kw));

                return matchesDomain || matchesKeyword;
            });
        }

        // Filter out passed deadlines if sorted by deadline
        if (sortBy === 'deadline') {
            filteredCfps = filteredCfps.filter(cfp => !isCfpDeadlinePassed(cfp));
        }

        // Sort the array of tracks
        filteredCfps.sort((a, b) => {
            let valA, valB;

            if (sortBy === 'default') {
                let idxA = confOrder.indexOf(a.venue);
                let idxB = confOrder.indexOf(b.venue);
                if (idxA === -1) idxA = confOrder.length;
                if (idxB === -1) idxB = confOrder.length;
                
                if (idxA !== idxB) {
                    return idxA - idxB;
                }
                
                const dateA = parseDate(a.deadline);
                const dateB = parseDate(b.deadline);
                return dateA - dateB;
            }

            if (sortBy === 'name') {
                valA = a.venue.toLowerCase();
                valB = b.venue.toLowerCase();
                if (valA !== valB) {
                    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                const dateA = parseDate(a.deadline);
                const dateB = parseDate(b.deadline);
                return dateA - dateB;
            }

            if (sortBy === 'if') {
                const infoA = confInfo[a.venue] || {};
                const infoB = confInfo[b.venue] || {};
                valA = parseFloat(infoA.if) || 0.0;
                valB = parseFloat(infoB.if) || 0.0;
                
                if (valA === valB) {
                    return a.venue.localeCompare(b.venue);
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            if (sortBy === 'quartile') {
                const infoA = confInfo[a.venue] || {};
                const infoB = confInfo[b.venue] || {};
                const mapRank = (rank) => {
                    if (rank === 'Q1') return 1;
                    if (rank === 'Q2') return 2;
                    if (rank === 'Q3') return 3;
                    if (rank === 'Q4') return 4;
                    return 99;
                };
                valA = mapRank(infoA.quartile);
                valB = mapRank(infoB.quartile);
                
                if (valA === valB) {
                    return a.venue.localeCompare(b.venue);
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            if (sortBy === 'deadline') {
                valA = parseDate(a.deadline);
                valB = parseDate(b.deadline);
                if (valA.getTime() === valB.getTime()) {
                    return a.venue.localeCompare(b.venue);
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            
            if (sortBy === 'notification') {
                valA = parseDate(a.notification);
                valB = parseDate(b.notification);
                if (valA.getTime() === valB.getTime()) {
                    return a.venue.localeCompare(b.venue);
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            if (sortBy === 'track') {
                valA = (a.subtitle || 'General Submissions').toLowerCase();
                valB = (b.subtitle || 'General Submissions').toLowerCase();
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }

            return 0;
        });

        cfpList.innerHTML = generateTableHtml(filteredCfps);
        setupTableHeaderClicks();
        if (window._journalRanksApply) window._journalRanksApply();
    }

    function updateSortOrderVisibility() {
        const sortOrderBtn = document.getElementById('journal-sort-order');
        if (!sortOrderBtn) return;
        sortOrderBtn.style.display = (sortBy === 'default') ? 'none' : 'inline-flex';
    }

    function setupSort() {
        const sortBySelect = document.getElementById('journal-sort-by');
        const sortOrderBtn = document.getElementById('journal-sort-order');
        const orderIcon = document.getElementById('journal-order-icon');
        const orderText = document.getElementById('journal-order-text');

        updateSortOrderVisibility();

        if (sortBySelect) {
            sortBySelect.value = ['name', 'if', 'quartile', 'deadline'].includes(sortBy) ? sortBy : 'default';
            sortBySelect.addEventListener('change', (e) => {
                sortBy = e.target.value;
                if (sortBy === 'default') {
                    sortOrder = 'asc';
                } else if (sortBy === 'if') {
                    sortOrder = 'desc';
                } else {
                    sortOrder = 'asc';
                }
                if (orderIcon) orderIcon.innerText = sortOrder === 'asc' ? '▲' : '▼';
                if (orderText) orderText.innerText = sortOrder === 'asc' ? 'Asc' : 'Desc';
                updateSortOrderVisibility();
                renderCfps();
            });
        }

        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                if (orderIcon) {
                    orderIcon.innerText = sortOrder === 'asc' ? '▲' : '▼';
                }
                if (orderText) {
                    orderText.innerText = sortOrder === 'asc' ? 'Asc' : 'Desc';
                }
                renderCfps();
            });
        }
    }

    let ranksVisible = true;

    function setupRanksToggle() {
        const btn = document.getElementById('journal-ranks-toggle');
        if (!btn) return;

        function applyRanksState() {
            const tableWrapper = document.getElementById('journal-list');
            if (!tableWrapper) return;
            if (ranksVisible) {
                tableWrapper.classList.remove('ranks-hidden');
                btn.style.opacity = '1';
            } else {
                tableWrapper.classList.add('ranks-hidden');
                btn.style.opacity = '0.45';
            }
        }

        btn.addEventListener('click', () => {
            ranksVisible = !ranksVisible;
            applyRanksState();
        });

        window._journalRanksApply = applyRanksState;
    }

    setupSort();
    setupRanksToggle();
    loadData();
});
