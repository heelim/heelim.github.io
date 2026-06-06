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

        // Scroll to today after tab becomes visible
        setTimeout(scrollToToday, 100);
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
    const keywordContainer = document.getElementById('keyword-container');
    const domainContainer = document.getElementById('domain-container');

    const upcomingList = document.getElementById('upcoming-list');
    const upcomingKeywordContainer = document.getElementById('upcoming-keyword-container');
    const upcomingDomainContainer = document.getElementById('upcoming-domain-container');

    let allCfps = [];
    let confInfo = {};
    let confOrder = [];
    let selectedKeywords = new Set();
    let selectedDomains = new Set();
    let showPast = false;
    
    let upcomingSelectedKeywords = new Set();
    let upcomingSelectedDomains = new Set();
    let upcomingShowPast = false;
    
    const today = new Date();

    async function loadData() {
        try {
            const [cfpRes, infoRes, orderRes, updatedRes] = await Promise.all([
                fetch('cfp.json'),
                fetch('conf_info.json'),
                fetch('conf_order.json').catch(() => null),
                fetch('last.updated').catch(() => null)
            ]);
            const rawCfps = await cfpRes.json();
            allCfps = [];
            for (const [venue, years] of Object.entries(rawCfps)) {
                for (const [year, yearData] of Object.entries(years)) {
                    const shared = {
                        date: yearData.date || "",
                        start_date: yearData.start_date || "",
                        url: yearData.url || "",
                        location: yearData.location || ""
                    };
                    for (const [key, value] of Object.entries(yearData)) {
                        // Skip shared field keys
                        if (['date', 'start_date', 'url', 'location'].includes(key)) {
                            continue;
                        }
                        
                        const subtitle = key;
                        const entry = value;
                        allCfps.push({
                            venue,
                            year: parseInt(year),
                            subtitle: subtitle === "none" ? "" : subtitle,
                            // Fallback to shared details
                            date: entry.date !== undefined ? entry.date : shared.date,
                            start_date: entry.start_date !== undefined ? entry.start_date : shared.start_date,
                            url: entry.url !== undefined ? entry.url : shared.url,
                            location: entry.location !== undefined ? entry.location : shared.location,
                            // Subtitle-specific fields
                            deadline: entry.deadline,
                            abstract_deadline: entry.abstract_deadline,
                            early_notification: entry.early_notification,
                            notification: entry.notification,
                            is_verified: entry.is_verified
                        });
                    }
                }
            }
            confInfo = await infoRes.json();
            if (orderRes && orderRes.ok) {
                confOrder = await orderRes.json();
            }
            
            if (updatedRes && updatedRes.ok) {
                const dateStr = await updatedRes.text();
                const cleanDate = dateStr.trim();
                const el1 = document.getElementById('cfp-last-updated');
                if (el1) el1.innerText = `Last updated: ${cleanDate}`;
                const el2 = document.getElementById('upcoming-last-updated');
                if (el2) el2.innerText = `Last updated: ${cleanDate}`;
            }

            renderFilters();
            renderCfps();
            renderUpcomingCfps();
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
            { btnId: 'past-toggle', iconId: 'past-icon', activeBg: 'rgba(148, 163, 184, 0.2)', inactiveBg: 'rgba(148, 163, 184, 0.1)' },
            { btnId: 'upcoming-domain-toggle', wrapperId: 'upcoming-domain-collapsible', iconId: 'upcoming-domain-icon', activeBg: 'rgba(16, 185, 129, 0.2)', inactiveBg: 'rgba(16, 185, 129, 0.1)' },
            { btnId: 'upcoming-keyword-toggle', wrapperId: 'upcoming-keyword-collapsible', iconId: 'upcoming-keyword-icon', activeBg: 'rgba(59, 130, 246, 0.2)', inactiveBg: 'rgba(59, 130, 246, 0.1)' },
            { btnId: 'upcoming-past-toggle', iconId: 'upcoming-past-icon', activeBg: 'rgba(148, 163, 184, 0.2)', inactiveBg: 'rgba(148, 163, 184, 0.1)' }
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
                    } else if (t.btnId === 'upcoming-past-toggle') {
                        upcomingShowPast = !upcomingShowPast;
                        isExpanded = upcomingShowPast;
                        renderUpcomingCfps();
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
        const domainsHtml = sortedDomains.map(dom => `
            <label class="filter-chip">
                <input type="checkbox" class="domain-input" value="${dom}">
                ${dom}
            </label>
        `).join('');
        domainContainer.innerHTML = domainsHtml;
        upcomingDomainContainer.innerHTML = domainsHtml;

        // Render Keywords
        const sortedKeywords = Array.from(allKeywords).sort();
        const keywordsHtmlStr = sortedKeywords.map(kw => `
            <label class="filter-chip">
                <input type="checkbox" class="keyword-input" value="${kw}">
                ${kw}
            </label>
        `).join('');
        keywordContainer.innerHTML = keywordsHtmlStr;
        upcomingKeywordContainer.innerHTML = keywordsHtmlStr;

        // Listeners for Domains (CFP)
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

        // Listeners for Domains (Upcoming)
        upcomingDomainContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const dom = e.target.value;
                if (e.target.checked) {
                    upcomingSelectedDomains.add(dom);
                    e.target.parentElement.classList.add('domain-active');
                } else {
                    upcomingSelectedDomains.delete(dom);
                    e.target.parentElement.classList.remove('domain-active');
                }
                renderUpcomingCfps();
            });
        });

        // Listeners for Keywords (CFP)
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

        // Listeners for Keywords (Upcoming)
        upcomingKeywordContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const kw = e.target.value;
                if (e.target.checked) {
                    upcomingSelectedKeywords.add(kw);
                    e.target.parentElement.classList.add('active');
                } else {
                    upcomingSelectedKeywords.delete(kw);
                    e.target.parentElement.classList.remove('active');
                }
                renderUpcomingCfps();
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

    const monthWidth = 80;

    function getDateX(dateStr, startDate, totalMs, timelineWidth) {
        if (!dateStr || dateStr.trim() === "" || dateStr === "TBA" || dateStr === "TBD") return null;
        const d = parseDate(dateStr);
        if (d.getFullYear() === 9999) return null;
        const dateMs = d - startDate;
        const ratio = dateMs / totalMs;
        return Math.max(0, Math.min(1, ratio)) * timelineWidth;
    }

    function generateGanttHtml(filteredCfps, isCfpTab) {
        if (filteredCfps.length === 0) {
            return '<p style="color: #64748b; padding: 2rem; text-align: center;">No matching conferences found.</p>';
        }

        // Dynamically calculate year range to fit all conferences
        let computedMinYear = 2025;
        let computedMaxYear = 2027;
        
        allCfps.forEach(cfp => {
            if (cfp.year) {
                if (cfp.year < computedMinYear) computedMinYear = cfp.year;
                if (cfp.year > computedMaxYear) computedMaxYear = cfp.year;
            }
        });
        
        const totalMonths = (computedMaxYear - computedMinYear + 1) * 12;
        const timelineWidth = totalMonths * monthWidth;
        const startDate = new Date(computedMinYear, 0, 1);
        const endDate = new Date(computedMaxYear, 11, 31);
        const totalMs = endDate - startDate;

        // Header Rows (Years and Months)
        let yearsHtml = '';
        let monthsHtml = '';
        const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let y = computedMinYear; y <= computedMaxYear; y++) {
            yearsHtml += `
                <div class="gantt-year-block" style="width: ${12 * monthWidth}px;">
                    ${y}
                </div>
            `;
            for (let m = 0; m < 12; m++) {
                monthsHtml += `
                    <div class="gantt-month-block" style="width: ${monthWidth}px;">
                        ${monthsNames[m]}
                    </div>
                `;
            }
        }

        // Today line position
        const todayStr = today.toISOString().split('T')[0];
        const todayX = getDateX(todayStr, startDate, totalMs, timelineWidth);
        let todayLineHtml = '';
        if (todayX !== null && todayX >= 0 && todayX <= timelineWidth) {
            todayLineHtml = `
                <div class="gantt-today-line" style="left: ${todayX}px;">
                    <div class="gantt-today-label">Today</div>
                </div>
            `;
        }

        // Group filtered cfps by venue (all years together)
        const grouped = [];
        const groupMap = new Map();
        
        filteredCfps.forEach(cfp => {
            const key = cfp.venue;
            if (!groupMap.has(key)) {
                const groupEntry = {
                    venue: cfp.venue,
                    url: cfp.url,
                    is_verified: cfp.is_verified,
                    cycles: [cfp]
                };
                groupMap.set(key, groupEntry);
                grouped.push(groupEntry);
            } else {
                const existing = groupMap.get(key);
                existing.cycles.push(cfp);
                if (cfp.is_verified) {
                    existing.is_verified = true;
                }
                if (!existing.url && cfp.url) {
                    existing.url = cfp.url;
                }
            }
        });

        // Sort grouped by confOrder
        grouped.sort((a, b) => {
            let idxA = confOrder.indexOf(a.venue);
            let idxB = confOrder.indexOf(b.venue);
            if (idxA === -1) idxA = confOrder.length;
            if (idxB === -1) idxB = confOrder.length;
            return idxA - idxB;
        });

        // Rows mapping (Separated into Labels and Timelines)
        let labelsHtml = '';
        let timelineRowsHtml = '';

        grouped.forEach((group, index) => {
            const info = confInfo[group.venue] || {};
            
            // Determine if the group is past
            let isPast = true;
            group.cycles.forEach(cfp => {
                const refDateStr = isCfpTab ? cfp.deadline : (cfp.start_date || cfp.date || cfp.deadline);
                const refDate = parseDate(refDateStr);
                if (refDate >= today) {
                    isPast = false;
                }
            });

            const bkText = info.bk21plus ? `🎓 ${info.bk21plus}` : '';
            let kiiseText = '';
            if (info.kiise === '최우수') {
                kiiseText = '🏆 최우수';
            } else if (info.kiise === '우수') {
                kiiseText = '🥈 우수';
            } else if (info.kiise) {
                kiiseText = `✨ ${info.kiise}`;
            }
            const metaText = [bkText, kiiseText].filter(Boolean).join(' | ');

            // Calculate horizontal span for each cycle
            const getCycleSpan = (cfp) => {
                const dates = [
                    cfp.abstract_deadline,
                    cfp.deadline,
                    cfp.notification,
                    cfp.start_date,
                ];
                if (cfp.start_date) {
                    const startDateObj = parseDate(cfp.start_date);
                    const endDateObj = new Date(startDateObj);
                    endDateObj.setDate(startDateObj.getDate() + 4);
                    dates.push(endDateObj.toISOString().split('T')[0]);
                }
                
                let minX = Infinity;
                let maxX = -Infinity;
                dates.forEach(dateStr => {
                    const x = getDateX(dateStr, startDate, totalMs, timelineWidth);
                    if (x !== null) {
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                    }
                });
                return {
                    start: minX === Infinity ? 0 : minX - 20,
                    end: maxX === -Infinity ? 0 : maxX + 20
                };
            };

            // Modular round-robin track scheduling
            const trackLimit = Math.min(3, group.cycles.length);
            const cycleTracks = [];

            // Sort cycles by their start coordinate
            const sortedCycles = group.cycles.map(cfp => ({
                cfp,
                span: getCycleSpan(cfp)
            })).sort((a, b) => a.span.start - b.span.start);

            sortedCycles.forEach((item, idx) => {
                const assignedTrack = idx % trackLimit;
                cycleTracks.push({
                    cfp: item.cfp,
                    trackIndex: assignedTrack
                });
            });

            // Calculate max track index used
            let maxTrackIndex = -1;
            cycleTracks.forEach(ct => {
                if (ct.trackIndex > maxTrackIndex) {
                    maxTrackIndex = ct.trackIndex;
                }
            });
            const maxTracksUsed = maxTrackIndex === -1 ? 1 : (maxTrackIndex + 1);
            const rowHeight = 30 + maxTracksUsed * 20;

            let elementsHtml = '';

            cycleTracks.forEach(item => {
                const cfp = item.cfp;
                const cycleSuffix = cfp.subtitle ? ` (${cfp.subtitle})` : '';
                const trackTop = 15 + item.trackIndex * 20;

                // 1. Review Phase (deadline -> notification)
                const dlX = getDateX(cfp.deadline, startDate, totalMs, timelineWidth);
                const notifX = getDateX(cfp.notification, startDate, totalMs, timelineWidth);
                
                if (dlX !== null && notifX !== null && notifX > dlX) {
                    elementsHtml += `
                        <div class="gantt-review-bar" style="left: ${dlX}px; width: ${notifX - dlX}px; top: ${trackTop + 5}px; height: 10px; border-radius: 3px;">
                            <div class="gantt-tooltip">
                                <strong>Review Phase${cycleSuffix}</strong><br>
                                Deadline: ${cfp.deadline}<br>
                                Notification: ${cfp.notification}
                            </div>
                        </div>
                    `;
                }

                // 2. Abstract to Submission connecting bar (if both exist)
                const abstX = getDateX(cfp.abstract_deadline, startDate, totalMs, timelineWidth);
                if (abstX !== null && dlX !== null && dlX > abstX) {
                    elementsHtml += `
                        <div class="gantt-abstract-bar" style="left: ${abstX}px; width: ${dlX - abstX}px; top: ${trackTop + 5}px; height: 10px; border-radius: 3px;">
                            <div class="gantt-tooltip">
                                <strong>Abstract to Submission Phase${cycleSuffix}</strong><br>
                                Abstract: ${cfp.abstract_deadline}<br>
                                Submission: ${cfp.deadline}
                            </div>
                        </div>
                    `;
                }

                // 3. Abstract Deadline (if any)
                if (abstX !== null) {
                    elementsHtml += `
                        <div class="gantt-deadline-bar" style="left: ${abstX}px; background: #60a5fa; top: ${trackTop + 1}px; height: 18px; width: 5px;">
                            <div class="gantt-tooltip">
                                <strong>Abstract Deadline${cycleSuffix}</strong><br>
                                Date: ${cfp.abstract_deadline}
                            </div>
                        </div>
                    `;
                }

                // 4. Submission Deadline
                if (dlX !== null) {
                    elementsHtml += `
                        <div class="gantt-deadline-bar" style="left: ${dlX}px; top: ${trackTop + 1}px; height: 18px; width: 5px;">
                            <div class="gantt-tooltip">
                                <strong>Submission Deadline${cycleSuffix}</strong><br>
                                Date: ${cfp.deadline}
                            </div>
                        </div>
                    `;
                }

                // 5. Notification Bar
                if (notifX !== null) {
                    elementsHtml += `
                        <div class="gantt-notification-bar" style="left: ${notifX}px; top: ${trackTop + 1}px; height: 18px; width: 5px;">
                            <div class="gantt-tooltip">
                                <strong>Notification Date${cycleSuffix}</strong><br>
                                Date: ${cfp.notification}
                            </div>
                        </div>
                    `;
                }

                // 6. Event Bar (start_date -> end_date)
                const startX = getDateX(cfp.start_date, startDate, totalMs, timelineWidth);
                if (startX !== null) {
                    let endX = null;
                    if (cfp.date && cfp.date.includes('-')) {
                        const rangeMatch = cfp.date.match(/-\s*([A-Za-z]+)?\s*(\d+),\s*(\d{4})/);
                        if (rangeMatch) {
                            const monthName = rangeMatch[1] || parseDate(cfp.start_date).toLocaleString('default', { month: 'long' });
                            const day = rangeMatch[2];
                            const year = rangeMatch[3];
                            const parsedEnd = new Date(`${monthName} ${day}, ${year}`);
                            if (!isNaN(parsedEnd)) {
                                endX = getDateX(parsedEnd.toISOString().split('T')[0], startDate, totalMs, timelineWidth);
                            }
                        }
                    }
                    
                    if (endX === null) {
                        const startDateObj = parseDate(cfp.start_date);
                        const endDateObj = new Date(startDateObj);
                        endDateObj.setDate(startDateObj.getDate() + 4);
                        endX = getDateX(endDateObj.toISOString().split('T')[0], startDate, totalMs, timelineWidth);
                    }

                    if (endX !== null && endX > startX) {
                        elementsHtml += `
                            <div class="gantt-event-bar" style="left: ${startX}px; width: ${Math.max(12, endX - startX)}px; top: ${trackTop + 6}px; height: 8px; border-radius: 4px;">
                                <div class="gantt-tooltip">
                                    <strong>Conference Event${cycleSuffix}</strong><br>
                                    Date: ${cfp.date}<br>
                                    Location: ${cfp.location}
                                </div>
                            </div>
                        `;
                    }
                }
            });

            const displayName = group.venue;
            const verifiedBadge = group.is_verified ? `<span class="gantt-badge-verified" title="Verified Deadline">✓</span>` : '';
            const displayUrl = group.url ? `<a href="${group.url}" target="_blank" class="gantt-venue-name">${displayName}${verifiedBadge}</a>` : `<span class="gantt-venue-name">${displayName}${verifiedBadge}</span>`;
            
            labelsHtml += `
                <div class="gantt-row-label-cell ${isPast ? 'past-row' : ''}" data-row-index="${index}" style="height: ${rowHeight}px;">
                    ${displayUrl}
                    <div class="gantt-venue-meta">${metaText}</div>
                </div>
            `;

            timelineRowsHtml += `
                <div class="gantt-row-timeline ${isPast ? 'past-row' : ''}" data-row-index="${index}" style="width: ${timelineWidth}px; height: ${rowHeight}px;">
                    ${elementsHtml}
                </div>
            `;
        });

        return `
            <div class="gantt-labels-column">
                <div class="gantt-corner-label">Conferences</div>
                ${labelsHtml}
            </div>
            <div class="gantt-timeline-scroll">
                <div class="gantt-timeline-header">
                    <div class="gantt-year-row" style="width: ${timelineWidth}px;">
                        ${yearsHtml}
                    </div>
                    <div class="gantt-month-row" style="width: ${timelineWidth}px;">
                        ${monthsHtml}
                    </div>
                </div>
                <div class="gantt-timeline-body" style="width: ${timelineWidth}px;">
                    ${todayLineHtml}
                    ${timelineRowsHtml}
                </div>
            </div>
        `;
    }

    function scrollToToday() {
        const containers = document.querySelectorAll('.gantt-container');
        containers.forEach(container => {
            let computedMinYear = 2025;
            let computedMaxYear = 2027;
            
            allCfps.forEach(cfp => {
                if (cfp.year) {
                    if (cfp.year < computedMinYear) computedMinYear = cfp.year;
                    if (cfp.year > computedMaxYear) computedMaxYear = cfp.year;
                }
            });
            
            const totalMonths = (computedMaxYear - computedMinYear + 1) * 12;
            const timelineWidth = totalMonths * monthWidth;
            const startDate = new Date(computedMinYear, 0, 1);
            const endDate = new Date(computedMaxYear, 11, 31);
            const totalMs = endDate - startDate;

            const todayStr = today.toISOString().split('T')[0];
            const todayX = getDateX(todayStr, startDate, totalMs, timelineWidth);
            if (todayX !== null) {
                // Find the scrollable timeline area inside this container
                const scrollArea = container.querySelector('.gantt-timeline-scroll');
                if (scrollArea) {
                    // Center this month (todayX) (subtract 20px for breathing room)
                    scrollArea.scrollLeft = Math.max(0, todayX - 20);
                }
            }
        });
    }

    function renderCfps() {
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

        cfpList.innerHTML = generateGanttHtml(filteredCfps, true);
        scrollToToday();
    }

    function renderUpcomingCfps() {
        // 1. Initial Filtering (Upcoming vs. Past based on start_date or fallback to date/deadline)
        let filteredCfps = allCfps.filter(cfp => {
            const eventDate = parseDate(cfp.start_date || cfp.date || cfp.deadline);
            if (upcomingShowPast) return true;
            return eventDate >= today;
        });

        // 2. Multi-category Filtering (Domain OR Keyword)
        if (upcomingSelectedKeywords.size > 0 || upcomingSelectedDomains.size > 0) {
            filteredCfps = filteredCfps.filter(cfp => {
                const info = confInfo[cfp.venue];
                if (!info) return false;

                const matchesDomain = info.domains && info.domains.some(dom => upcomingSelectedDomains.has(dom));
                const matchesKeyword = info.keywords && info.keywords.some(kw => upcomingSelectedKeywords.has(kw));

                return matchesDomain || matchesKeyword;
            });
        }

        upcomingList.innerHTML = generateGanttHtml(filteredCfps, false);
        scrollToToday();
    }

    function setupHoverSync() {
        const handleHover = (e, isEnter) => {
            const rowEl = e.target.closest('[data-row-index]');
            if (!rowEl) return;
            
            const rowIndex = rowEl.getAttribute('data-row-index');
            const container = rowEl.closest('.gantt-container');
            if (!container || rowIndex === null) return;
            
            const matchingRows = container.querySelectorAll(`[data-row-index="${rowIndex}"]`);
            matchingRows.forEach(el => {
                if (isEnter) {
                    el.classList.add('gantt-row-hover');
                } else {
                    el.classList.remove('gantt-row-hover');
                }
            });
        };

        document.querySelectorAll('.gantt-container').forEach(container => {
            container.addEventListener('mouseover', (e) => handleHover(e, true));
            container.addEventListener('mouseout', (e) => handleHover(e, false));
        });
    }

    setupHoverSync();
    loadData();
});
