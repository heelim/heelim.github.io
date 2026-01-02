document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');

            // Update nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(tab => {
                if (tab.id === tabId) {
                    tab.classList.remove('hidden');
                } else {
                    tab.classList.add('hidden');
                }
            });
        });
    });

    const cfpList = document.getElementById('cfp-list');
    const sortDeadlineBtn = document.getElementById('sort-deadline');
    const sortDateBtn = document.getElementById('sort-date');

    let allCfps = [];
    const today = new Date('2026-01-02'); // Based on user's current local time

    async function loadCfps() {
        try {
            const response = await fetch('cfp.json');
            const data = await response.json();

            // Filter out past deadlines
            allCfps = data.filter(item => {
                const deadline = new Date(item.deadline);
                return deadline >= today;
            });

            renderCfps('deadline');
        } catch (error) {
            console.error('Error loading CFPs:', error);
            cfpList.innerHTML = '<p style="color: #ef4444;">Failed to load conference data.</p>';
        }
    }

    function renderCfps(sortBy) {
        if (sortBy === 'deadline') {
            allCfps.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            sortDeadlineBtn.classList.add('active');
            sortDateBtn.classList.remove('active');
        } else {
            allCfps.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            sortDateBtn.classList.add('active');
            sortDeadlineBtn.classList.remove('active');
        }

        if (allCfps.length === 0) {
            cfpList.innerHTML = '<p style="color: #64748b;">No upcoming deadlines found.</p>';
            return;
        }

        cfpList.innerHTML = allCfps.map(cfp => {
            const deadlineDate = new Date(cfp.deadline);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dDayText = diffDays === 0 ? 'D-Day' : `D-${diffDays}`;

            return `
        <div class="pub-item" style="margin-bottom: 0.5rem; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <span class="item-title" style="font-weight: 600;">
              ${cfp.url ? `<a href="${cfp.url}" target="_blank" style="color: var(--accent); text-decoration: none;">${cfp.venue}</a>` : `<span style="color: var(--accent);">${cfp.venue}</span>`} 
              <span style="color: var(--accent);">${cfp.year}</span>
              ${cfp.subtitle ? `<span style="color: #94a3b8; font-weight: 400; font-size: 0.9em;">(${cfp.subtitle})</span>` : ''}
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
        </div>
      `;
        }).join('');
    }

    sortDeadlineBtn.addEventListener('click', () => renderCfps('deadline'));
    sortDateBtn.addEventListener('click', () => renderCfps('date'));

    loadCfps();
});
