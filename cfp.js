document.addEventListener('DOMContentLoaded', () => {
    function showTab(tabId) {
        if (!tabId) return;
        if (!document.getElementById(tabId)) {
            tabId = 'profile';
            window.location.hash = tabId;
        }

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
                        finish_date: yearData.finish_date || "",
                        url: yearData.url || "",
                        location: yearData.location || ""
                    };
                    for (const [key, value] of Object.entries(yearData)) {
                        // Skip shared field keys
                        if (['date', 'start_date', 'finish_date', 'url', 'location'].includes(key)) {
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
                            finish_date: entry.finish_date !== undefined ? entry.finish_date : shared.finish_date,
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
            if (confOrder && confOrder.length > 0) {
                const confOrderSet = new Set(confOrder);
                allCfps = allCfps.filter(cfp => confOrderSet.has(cfp.venue));
            }
            
            if (updatedRes && updatedRes.ok) {
                const dateStr = await updatedRes.text();
                const cleanDate = dateStr.trim();
                const el1 = document.getElementById('cfp-last-updated');
                if (el1) el1.innerText = `Last updated: ${cleanDate}`;
            }

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
            { btnId: 'keyword-toggle', wrapperId: 'keyword-collapsible', iconId: 'keyword-icon', activeBg: 'rgba(59, 130, 246, 0.2)', inactiveBg: 'rgba(59, 130, 246, 0.1)' }
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

    function toIsoDate(date) {
        return date.toISOString().split('T')[0];
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function parseConferenceDateRange(cfp) {
        const startDateObj = parseDate(cfp.start_date);
        const finishDateObj = parseDate(cfp.finish_date);
        if (startDateObj.getFullYear() === 9999) return null;
        if (finishDateObj.getFullYear() === 9999) return null;

        return {
            start: toIsoDate(startDateObj),
            end: toIsoDate(addDays(finishDateObj, 1))
        };
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

    function generateGanttHtml(filteredCfps) {
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

        // Outer helper functions for interval calculations
        const getSubmissionInterval = (cfp) => {
            const dates = [
                cfp.abstract_deadline,
                cfp.deadline,
                cfp.notification
            ].filter(Boolean);
            
            let minX = Infinity;
            let maxX = -Infinity;
            dates.forEach(dateStr => {
                const x = getDateX(dateStr, startDate, totalMs, timelineWidth);
                if (x !== null) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                }
            });
            if (minX === Infinity || maxX === -Infinity) return null;
            return { start: minX - 8, end: maxX + 8 };
        };

        const getConferenceInterval = (cfp) => {
            const conferenceRange = parseConferenceDateRange(cfp);
            if (!conferenceRange) return null;
            const startX = getDateX(conferenceRange.start, startDate, totalMs, timelineWidth);
            const endX = getDateX(conferenceRange.end, startDate, totalMs, timelineWidth);
            if (startX === null || endX === null) return null;
            return { start: startX - 8, end: endX + 8 };
        };

        const getSubmissionStart = (cfp) => {
            const dates = [cfp.abstract_deadline, cfp.deadline].filter(Boolean);
            let minX = Infinity;
            dates.forEach(dateStr => {
                const x = getDateX(dateStr, startDate, totalMs, timelineWidth);
                if (x !== null) {
                    minX = Math.min(minX, x);
                }
            });
            return minX;
        };

        const getSortKey = (cfp) => {
            const subStart = getSubmissionStart(cfp);
            if (subStart !== Infinity) return subStart;
            const confRange = parseConferenceDateRange(cfp);
            if (confRange) {
                const x = getDateX(confRange.start, startDate, totalMs, timelineWidth);
                if (x !== null) return x;
            }
            return Infinity;
        };

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

        // Sort grouped by current sort options
        grouped.sort((a, b) => {
            let valA, valB;

            if (sortBy === 'default') {
                let idxA = confOrder.indexOf(a.venue);
                let idxB = confOrder.indexOf(b.venue);
                if (idxA === -1) idxA = confOrder.length;
                if (idxB === -1) idxB = confOrder.length;
                return idxA - idxB;
            }

            if (sortBy === 'name') {
                valA = a.venue.toLowerCase();
                valB = b.venue.toLowerCase();
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            }

            if (sortBy === 'bk') {
                const infoA = confInfo[a.venue] || {};
                const infoB = confInfo[b.venue] || {};
                valA = parseInt(infoA.bk21plus) || 0;
                valB = parseInt(infoB.bk21plus) || 0;
                
                if (valA === 0 && valB === 0) {
                    return a.venue.localeCompare(b.venue);
                }
                if (valA === 0) return 1;
                if (valB === 0) return -1;
                
                if (valA !== valB) {
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                }
                return a.venue.localeCompare(b.venue);
            }

            if (sortBy === 'kiise') {
                const infoA = confInfo[a.venue] || {};
                const infoB = confInfo[b.venue] || {};
                const mapRank = (rank) => {
                    if (rank === '최우수') return 3;
                    if (rank === '우수') return 2;
                    return 0;
                };
                valA = mapRank(infoA.kiise);
                valB = mapRank(infoB.kiise);
                
                if (valA === 0 && valB === 0) {
                    return a.venue.localeCompare(b.venue);
                }
                if (valA === 0) return 1;
                if (valB === 0) return -1;
                
                if (valA !== valB) {
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                }
                return a.venue.localeCompare(b.venue);
            }

            if (sortBy === 'deadline') {
                const getNearestDeadline = (group) => {
                    let minDate = new Date(9999, 11, 31);
                    group.cycles.forEach(cfp => {
                        if (isCfpDeadlinePassed(cfp)) return;
                        const d = parseDate(cfp.deadline);
                        if (d < minDate) {
                            minDate = d;
                        }
                    });
                    return minDate;
                };
                valA = getNearestDeadline(a);
                valB = getNearestDeadline(b);
                if (valA.getFullYear() === 9999 && valB.getFullYear() === 9999) {
                    return a.venue.localeCompare(b.venue);
                }
                if (valA.getFullYear() === 9999) return 1;
                if (valB.getFullYear() === 9999) return -1;
                if (valA.getTime() !== valB.getTime()) {
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                }
                return a.venue.localeCompare(b.venue);
            }

            if (sortBy === 'start_date') {
                const getNearestStart = (group) => {
                    let minDate = new Date(9999, 11, 31);
                    group.cycles.forEach(cfp => {
                        if (isCfpStartDatePassed(cfp)) return;
                        const d = parseDate(cfp.start_date);
                        if (d < minDate) {
                            minDate = d;
                        }
                    });
                    return minDate;
                };
                valA = getNearestStart(a);
                valB = getNearestStart(b);
                if (valA.getFullYear() === 9999 && valB.getFullYear() === 9999) {
                    return a.venue.localeCompare(b.venue);
                }
                if (valA.getFullYear() === 9999) return 1;
                if (valB.getFullYear() === 9999) return -1;
                if (valA.getTime() !== valB.getTime()) {
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                }
                return a.venue.localeCompare(b.venue);
            }

            return 0;
        });

        // Rows mapping (Separated into Labels and Timelines)
        let labelsHtml = '';
        let timelineRowsHtml = '';

        grouped.forEach((group, index) => {
            const info = confInfo[group.venue] || {};
            
            const bkText = info.bk21plus ? `🎓 ${info.bk21plus}` : '';
            let kiiseText = '';
            if (info.kiise === '최우수') {
                kiiseText = '🏆 최우수';
            } else if (info.kiise === '우수') {
                kiiseText = '🥈 우수';
            } else if (info.kiise) {
                kiiseText = `✨ ${info.kiise}`;
            }
            const metaText = [bkText, kiiseText].filter(Boolean).join(' ');

            // Group cycles by year to implement year-exclusive scheduling
            const cyclesByYear = {};
            group.cycles.forEach(cfp => {
                const yr = cfp.year || 9999;
                if (!cyclesByYear[yr]) {
                    cyclesByYear[yr] = [];
                }
                cyclesByYear[yr].push(cfp);
            });

            // Sort years chronologically
            const sortedYears = Object.keys(cyclesByYear).map(Number).sort((a, b) => a - b);

            // Compute occupied intervals per year to check for inter-year overlaps
            const yearIntervals = {};
            sortedYears.forEach(year => {
                let minX = Infinity;
                let maxX = -Infinity;
                cyclesByYear[year].forEach(cfp => {
                    const subInt = getSubmissionInterval(cfp);
                    if (subInt) {
                        minX = Math.min(minX, subInt.start);
                        maxX = Math.max(maxX, subInt.end);
                    }
                    const confInt = getConferenceInterval(cfp);
                    if (confInt) {
                        minX = Math.min(minX, confInt.start);
                        maxX = Math.max(maxX, confInt.end);
                    }
                });
                if (minX === Infinity) minX = 0;
                if (maxX === -Infinity) maxX = 0;
                yearIntervals[year] = { start: minX, end: maxX };
            });

            let hasYearOverlap = false;
            for (let i = 0; i < sortedYears.length; i++) {
                for (let j = i + 1; j < sortedYears.length; j++) {
                    const intA = yearIntervals[sortedYears[i]];
                    const intB = yearIntervals[sortedYears[j]];
                    if (intA.start < intB.end && intB.start < intA.end) {
                        hasYearOverlap = true;
                        break;
                    }
                }
                if (hasYearOverlap) break;
            }

            const cycleTracks = [];
            let accumulatedTracks = 0;

            const overlaps = (intA, intB) => {
                return intA.start < intB.end && intB.start < intA.end;
            };

            const canPlaceOnTrack = (itemOccupied, trackIntervals) => {
                for (const itemInt of itemOccupied) {
                    for (const trackInt of trackIntervals) {
                        if (overlaps(itemInt, trackInt)) {
                            return false;
                        }
                    }
                }
                return true;
            };

            sortedYears.forEach(year => {
                const yearCycles = cyclesByYear[year];
                // Sort cycles of this year chronologically by sortKey
                const sortedYearCycles = yearCycles.map(cfp => ({
                    cfp,
                    sortKey: getSortKey(cfp)
                })).sort((a, b) => a.sortKey - b.sortKey);

                // Determine which cycle renders the conference event bar.
                const eventBarDates = new Set();
                sortedYearCycles.forEach(item => {
                    const conferenceRange = parseConferenceDateRange(item.cfp);
                    if (conferenceRange) {
                        const key = `${conferenceRange.start}_${conferenceRange.end}`;
                        if (!eventBarDates.has(key)) {
                            eventBarDates.add(key);
                            item.rendersEventBar = true;
                        } else {
                            item.rendersEventBar = false;
                        }
                    } else {
                        item.rendersEventBar = false;
                    }
                });

                // Greedy track scheduling *within* this year
                const yearTracksIntervals = [];

                sortedYearCycles.forEach(item => {
                    const occupied = [];
                    const subInt = getSubmissionInterval(item.cfp);
                    if (subInt) occupied.push(subInt);
                    if (item.rendersEventBar) {
                        const confInt = getConferenceInterval(item.cfp);
                        if (confInt) occupied.push(confInt);
                    }

                    let assignedTrack = 0;
                    while (assignedTrack < yearTracksIntervals.length) {
                        if (canPlaceOnTrack(occupied, yearTracksIntervals[assignedTrack])) {
                            break;
                        }
                        assignedTrack++;
                    }

                    if (!yearTracksIntervals[assignedTrack]) {
                        yearTracksIntervals[assignedTrack] = [];
                    }
                    yearTracksIntervals[assignedTrack].push(...occupied);

                    cycleTracks.push({
                        cfp: item.cfp,
                        trackIndex: (hasYearOverlap ? accumulatedTracks : 0) + assignedTrack
                    });
                });

                const yearTracksUsed = yearTracksIntervals.length || 1;
                if (hasYearOverlap) {
                    accumulatedTracks += yearTracksUsed;
                } else {
                    accumulatedTracks = Math.max(accumulatedTracks, yearTracksUsed);
                }
            });

            const maxTracksUsed = accumulatedTracks || 1;
            const rowHeight = 16 + maxTracksUsed * 14;

            let elementsHtml = '';
            const renderedEventYears = new Set();

            cycleTracks.forEach(item => {
                const cfp = item.cfp;
                const cycleSuffix = ` (${cfp.year}${cfp.subtitle ? ` (${cfp.subtitle})` : ''})`;
                const trackTop = 8 + item.trackIndex * 14;

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

                // 6. Event Bar (start_date -> end_date), once per conference year.
                const conferenceRange = parseConferenceDateRange(cfp);
                const startX = conferenceRange ? getDateX(conferenceRange.start, startDate, totalMs, timelineWidth) : null;
                if (conferenceRange && startX !== null && !renderedEventYears.has(cfp.year)) {
                    renderedEventYears.add(cfp.year);
                    const endX = getDateX(conferenceRange.end, startDate, totalMs, timelineWidth);

                    if (endX !== null && endX > startX) {
                        elementsHtml += `
                            <div class="gantt-event-bar" style="left: ${startX}px; width: ${Math.max(12, endX - startX)}px; top: ${trackTop + 6}px; height: 8px; border-radius: 4px;">
                                <div class="gantt-tooltip">
                                    <strong>${cfp.venue} ${cfp.year}</strong><br>
                                    Date: ${cfp.date}<br>
                                    Location: ${cfp.location}
                                </div>
                            </div>
                        `;
                    }
                }
            });

            const displayName = group.venue;
            const displayUrl = group.url 
                ? `<a href="${group.url}" target="_blank" class="gantt-venue-name" style="flex-shrink: 1;">${displayName}</a>` 
                : `<span class="gantt-venue-name" style="flex-shrink: 1;">${displayName}</span>`;
            const metaSuffix = metaText 
                ? `<span class="gantt-venue-meta" style="margin-top: 0; display: inline-flex; flex-shrink: 0; white-space: nowrap;">${metaText}</span>` 
                : '';
            
            const bkRaw = info.bk21plus ? `${info.bk21plus}` : '';
            const kiiseRaw = info.kiise ? `${info.kiise}` : '';

            labelsHtml += `
                <div class="gantt-row-label-cell" data-row-index="${index}" style="height: ${rowHeight}px;">
                    <div class="gantt-label-name-cell">${displayUrl}</div>
                    <div class="gantt-label-sub-cell gantt-label-bk">${bkRaw}</div>
                    <div class="gantt-label-sub-cell gantt-label-kiise">${kiiseRaw}</div>
                </div>
            `;

            timelineRowsHtml += `
                <div class="gantt-row-timeline" data-row-index="${index}" style="width: ${timelineWidth}px; height: ${rowHeight}px;">
                    ${elementsHtml}
                </div>
            `;
        });

        return `
            <div class="gantt-labels-column">
                <div class="gantt-corner-label">
                    <div class="gantt-corner-name">Conference</div>
                    <div class="gantt-corner-sub">BK</div>
                    <div class="gantt-corner-sub">KIISE</div>
                </div>
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
        // 1. Start with all conferences.
        let filteredCfps = allCfps;

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

        // 3. Filter out passed deadlines or start dates if sorting by them
        if (sortBy === 'deadline') {
            filteredCfps = filteredCfps.filter(cfp => !isCfpDeadlinePassed(cfp));
        } else if (sortBy === 'start_date') {
            filteredCfps = filteredCfps.filter(cfp => !isCfpStartDatePassed(cfp));
        }

        cfpList.innerHTML = generateGanttHtml(filteredCfps);
        scrollToToday();
        if (window._ranksApply) window._ranksApply();
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

    function updateSortOrderVisibility() {
        const sortOrderBtn = document.getElementById('sort-order');
        if (!sortOrderBtn) return;
        sortOrderBtn.style.display = (sortBy === 'default') ? 'none' : 'inline-flex';
    }

    function setupSort() {
        const sortBySelect = document.getElementById('sort-by');
        const sortOrderBtn = document.getElementById('sort-order');
        const orderIcon = document.getElementById('order-icon');
        const orderText = document.getElementById('order-text');

        updateSortOrderVisibility();

        if (sortBySelect) {
            sortBySelect.value = sortBy;
            sortBySelect.addEventListener('change', (e) => {
                sortBy = e.target.value;
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
        const btn = document.getElementById('ranks-toggle');
        if (!btn) return;

        function applyRanksState() {
            const labelsCol = document.querySelector('.gantt-labels-column');
            if (!labelsCol) return;
            if (ranksVisible) {
                labelsCol.classList.remove('ranks-hidden');
                btn.style.opacity = '1';
            } else {
                labelsCol.classList.add('ranks-hidden');
                btn.style.opacity = '0.45';
            }
        }

        btn.addEventListener('click', () => {
            ranksVisible = !ranksVisible;
            applyRanksState();
        });

        // Re-apply after each render (gantt HTML is regenerated)
        const origRender = renderCfps;
        window._ranksApply = applyRanksState;
    }

    setupHoverSync();
    setupSort();
    setupRanksToggle();
    loadData();
});
