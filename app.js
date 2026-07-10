document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const navPickerBtn = document.getElementById('nav-picker-btn');
    const navSettingsBtn = document.getElementById('nav-settings-btn');
    const navAboutBtn = document.getElementById('nav-about-btn');

    const panelOverlay = document.getElementById('panel-overlay');
    const pickerPanel = document.getElementById('picker-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const aboutPanel = document.getElementById('about-panel');
    const closeBtns = document.querySelectorAll('.close-panel-btn');

    const toggleDarkMode = document.getElementById('toggle-dark-mode');
    const toggleShortNames = document.getElementById('toggle-short-names');
    const toggleAutoSkip = document.getElementById('toggle-auto-skip');
    const toggleHighlightCurrent = document.getElementById('toggle-highlight-current');
    const exportIcsBtn = document.getElementById('export-ics-btn');

    // Accordeon Menu
    const stepFaculty = document.getElementById('step-faculty');
    const stepSpec = document.getElementById('step-spec');
    const stepYear = document.getElementById('step-year');
    const stepCode = document.getElementById('step-code');
    const stepSubgroup = document.getElementById('step-subgroup');

    const gridFaculty = document.getElementById('grid-faculty');
    const gridSpec = document.getElementById('grid-spec');
    const gridYear = document.getElementById('grid-year');
    const gridCode = document.getElementById('grid-code');
    const gridSubgroup = document.getElementById('grid-subgroup');

    const scheduleContainer = document.getElementById('schedule-container');
    const emptyState = document.getElementById('empty-state');
    const classesList = document.getElementById('classes-list');
    const currentSelectionPathDisplay = document.getElementById('current-selection-path');

    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const currentDateDisplay = document.getElementById('current-date-display');
    const calendarModal = document.getElementById('calendar-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const calPrevMonth = document.getElementById('cal-prev-month');
    const calNextMonth = document.getElementById('cal-next-month');
    const calMonthYear = document.getElementById('cal-month-year');
    const calendarGrid = document.querySelector('.calendar-grid');

    // State
    let facultiesData = [];
    let currentSchedule = null;
    let currentDate = null;
    let scheduleDays = [];
    let calDisplayDate = new Date();

    let selectionState = {
        faculty: null,
        specName: null,
        year: null,
        code: null,
        subgroup: null
    };

    let settings = {
        darkMode: false,
        shortNames: false,
        autoSkip: true,
        highlightCurrent: true
    };

    // Init
    loadSettings();
    loadSavedPath();
    fetchFaculties();

    // Panel Logic
    function openPanel(panel) {
        panelOverlay.classList.remove('hidden');
        panel.classList.remove('hidden');
        setTimeout(() => panel.classList.add('open'), 10);
    }

    function closeAllPanels() {
        pickerPanel.classList.remove('open');
        settingsPanel.classList.remove('open');
        aboutPanel.classList.remove('open');
        setTimeout(() => {
            pickerPanel.classList.add('hidden');
            settingsPanel.classList.add('hidden');
            aboutPanel.classList.add('hidden');
            panelOverlay.classList.add('hidden');
        }, 300);
    }

    navPickerBtn.addEventListener('click', () => openPanel(pickerPanel));
    navSettingsBtn.addEventListener('click', () => openPanel(settingsPanel));
    navAboutBtn.addEventListener('click', () => openPanel(aboutPanel));
    panelOverlay.addEventListener('click', closeAllPanels);
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('open');
            setTimeout(() => {
                document.getElementById(targetId).classList.add('hidden');
                panelOverlay.classList.add('hidden');
            }, 300);
        });
    });

    // Settings Logic
    function loadSettings() {
        const savedSettings = localStorage.getItem('pwszSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
        }
        applySettings();
    }

    function saveSettings() {
        localStorage.setItem('pwszSettings', JSON.stringify(settings));
        applySettings();
        if (currentSchedule) {
            renderScheduleForDate(currentDate);
        }
    }

    function applySettings() {
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            toggleDarkMode.checked = true;
        } else {
            document.documentElement.removeAttribute('data-theme');
            toggleDarkMode.checked = false;
        }
        toggleShortNames.checked = settings.shortNames;
        toggleAutoSkip.checked = settings.autoSkip;
        toggleHighlightCurrent.checked = settings.highlightCurrent;
        updateHighlights();
    }

    toggleDarkMode.addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        saveSettings();
    });

    toggleShortNames.addEventListener('change', (e) => {
        settings.shortNames = e.target.checked;
        saveSettings();
    });

    toggleAutoSkip.addEventListener('change', (e) => {
        settings.autoSkip = e.target.checked;
        saveSettings();
    });

    toggleHighlightCurrent.addEventListener('change', (e) => {
        settings.highlightCurrent = e.target.checked;
        saveSettings();
    });

    // Persistence Logic
    function loadSavedPath() {
        const saved = localStorage.getItem('pwszSavedPath');
        if (saved) {
            selectionState = JSON.parse(saved);
        }
    }

    function savePath() {
        localStorage.setItem('pwszSavedPath', JSON.stringify(selectionState));
    }

    // Utility
    function sanitize(name) {
        return name.replace(/[\\/*?:"<>|]/g, "").trim();
    }

    function getPath() {
        const f = sanitize(selectionState.faculty.faculty_name);
        const s = sanitize(selectionState.specName);
        const y = sanitize(selectionState.year);
        const c = sanitize(selectionState.code);
        return `${f}/${s}/${y}/${c}`;
    }

    function openAccordionStep(step) {
        [stepFaculty, stepSpec, stepYear, stepCode, stepSubgroup].forEach(s => s.removeAttribute('open'));
        step.setAttribute('open', '');
    }

    function createPickBtn(text, onClick) {
        const btn = document.createElement('button');
        btn.className = 'pick-btn';
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    }

    // Data Fetching & Picker UI
    async function fetchFaculties() {
        try {
            const res = await fetch('data/list_faculties.json');
            const data = await res.json();
            facultiesData = data.faculties;

            buildFacultyGrid();

            if (selectionState.subgroup) {
                const fac = facultiesData.find(f => f.faculty_name === selectionState.faculty.faculty_name);
                if (fac) {
                    selectionState.faculty = fac;
                    await fetchSchedule();
                } else {
                    selectionState.subgroup = null;
                    openPanel(pickerPanel);
                }
            } else {
                openPanel(pickerPanel);
            }
        } catch (e) {
            console.error("Failed to load faculties", e);
        }
    }

    function buildFacultyGrid() {
        gridFaculty.innerHTML = '';
        facultiesData.forEach(fac => {
            const btn = createPickBtn(fac.faculty_name, () => {
                selectionState.faculty = fac;
                selectionState.specName = null;
                selectionState.year = null;
                selectionState.code = null;
                selectionState.subgroup = null;
                updatePickerButtons(gridFaculty, btn);
                buildSpecGrid();
            });
            if (selectionState.faculty && fac.faculty_name === selectionState.faculty.faculty_name) {
                btn.classList.add('active');
            }
            gridFaculty.appendChild(btn);
        });
    }

    function buildSpecGrid() {
        gridSpec.innerHTML = '';
        gridYear.innerHTML = '';
        gridCode.innerHTML = '';
        gridSubgroup.innerHTML = '';

        const specs = selectionState.faculty.specializations;
        const uniqueNames = [...new Set(specs.map(s => s.name))];

        uniqueNames.forEach(name => {
            const btn = createPickBtn(name, () => {
                selectionState.specName = name;
                selectionState.year = null;
                selectionState.code = null;
                selectionState.subgroup = null;
                updatePickerButtons(gridSpec, btn);
                buildYearGrid();
            });
            if (selectionState.specName === name) btn.classList.add('active');
            gridSpec.appendChild(btn);
        });
        openAccordionStep(stepSpec);
    }

    function buildYearGrid() {
        gridYear.innerHTML = '';
        gridCode.innerHTML = '';
        gridSubgroup.innerHTML = '';

        const specs = selectionState.faculty.specializations.filter(s => s.name === selectionState.specName);
        const uniqueYears = [...new Set(specs.map(s => s.year))];

        uniqueYears.forEach(year => {
            const btn = createPickBtn(year, () => {
                selectionState.year = year;
                selectionState.code = null;
                selectionState.subgroup = null;
                updatePickerButtons(gridYear, btn);
                buildCodeGrid();
            });
            if (selectionState.year === year) btn.classList.add('active');
            gridYear.appendChild(btn);
        });
        openAccordionStep(stepYear);
    }

    function buildCodeGrid() {
        gridCode.innerHTML = '';
        gridSubgroup.innerHTML = '';

        const specs = selectionState.faculty.specializations.filter(s => s.name === selectionState.specName && s.year === selectionState.year);

        specs.forEach(spec => {
            const btn = createPickBtn(spec.code, () => {
                selectionState.code = spec.code;
                selectionState.subgroup = null;
                updatePickerButtons(gridCode, btn);
                fetchSubgroups();
            });
            if (selectionState.code === spec.code) btn.classList.add('active');
            gridCode.appendChild(btn);
        });
        openAccordionStep(stepCode);
    }

    async function fetchSubgroups() {
        openAccordionStep(stepSubgroup);
        gridSubgroup.innerHTML = '<i>Ładowanie...</i>';

        try {
            const path = getPath();
            const res = await fetch(`data/${path}/subgroups.json`);
            if (!res.ok) throw new Error("No subgroups");
            const subgroups = await res.json();

            gridSubgroup.innerHTML = '';
            subgroups.forEach(sg => {
                const btn = createPickBtn(sg, () => {
                    selectionState.subgroup = sg;
                    updatePickerButtons(gridSubgroup, btn);
                    savePath();
                    closeAllPanels();
                    fetchSchedule();
                });
                gridSubgroup.appendChild(btn);
            });
        } catch (e) {
            gridSubgroup.innerHTML = '<i style="color:var(--danger)">Brak harmonogramu.</i>';
        }
    }

    function updatePickerButtons(container, activeBtn) {
        container.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Schedule Rendering
    async function fetchSchedule() {
        emptyState.classList.add('hidden');
        scheduleContainer.classList.remove('hidden');
        classesList.innerHTML = '<i>Ładowanie harmonogramu...</i>';

        currentSelectionPathDisplay.textContent = `${selectionState.faculty.faculty_name} > ${selectionState.specName} > Rok ${selectionState.year} > ${selectionState.code} > ${selectionState.subgroup}`;

        try {
            const path = getPath();
            const file = `schedule_${sanitize(selectionState.subgroup)}.json`;
            const res = await fetch(`data/${path}/${file}`);
            if (!res.ok) throw new Error("Failed to load");

            const data = await res.json();
            const groupData = data[selectionState.subgroup];
            if (!groupData) throw new Error("Invalid format");

            currentSchedule = {};
            scheduleDays = [];

            for (const [dayString, classes] of Object.entries(groupData)) {
                const dateMatch = dayString.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    const d = dateMatch[0];
                    currentSchedule[d] = classes;
                    scheduleDays.push(d);
                }
            }

            scheduleDays.sort();

            // Always default to today
            const todayStr = new Date().toISOString().split('T')[0];
            currentDate = todayStr;

            if (settings.autoSkip && scheduleDays.length > 0 && !currentSchedule[currentDate]) {
                const nextDay = scheduleDays.find(day => day > currentDate);
                if (nextDay) currentDate = nextDay;
            }

            renderScheduleForDate(currentDate);

        } catch (e) {
            classesList.innerHTML = '<i style="color:var(--danger)">Nie można załadować danych.</i>';
        }
    }

    function renderScheduleForDate(dateStr) {
        if (!dateStr || !currentSchedule || !currentSchedule[dateStr]) {
            currentDateDisplay.textContent = dateStr ? new Date(dateStr).toLocaleDateString('pl-PL', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Wybierz dzień';
            classesList.innerHTML = '<div class="class-card"><i>Brak zajęć w tym dniu.</i></div>';
            return;
        }

        const dateObj = new Date(dateStr);
        currentDateDisplay.textContent = dateObj.toLocaleDateString('pl-PL', { weekday: 'long', month: 'long', day: 'numeric' });

        classesList.innerHTML = '';
        currentSchedule[dateStr].forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card';

            const displayName = settings.shortNames && cls.short_name ? cls.short_name : cls.class_name;

            card.innerHTML = `
                <div class="class-time">${cls.time}</div>
                <div class="class-details">
                    <div class="class-name">${displayName}</div>
                    <div class="class-teacher">${cls.teacher}</div>
                    <div class="class-room">Sala: ${cls.room}</div>
                </div>
            `;
            classesList.appendChild(card);
        });

        updateHighlights();
    }

    // Date Navigation
    prevDayBtn.addEventListener('click', () => changeDay(-1));
    nextDayBtn.addEventListener('click', () => changeDay(1));

    function changeDay(offset) {
        if (!currentDate) return;
        const d = new Date(currentDate);
        d.setDate(d.getDate() + offset);
        currentDate = d.toISOString().split('T')[0];

        if (settings.autoSkip && scheduleDays.length > 0 && (!currentSchedule || !currentSchedule[currentDate])) {
            if (offset > 0) {
                const nextDay = scheduleDays.find(day => day > currentDate);
                if (nextDay) currentDate = nextDay;
            } else {
                const prevDay = [...scheduleDays].reverse().find(day => day < currentDate);
                if (prevDay) currentDate = prevDay;
            }
        }

        renderScheduleForDate(currentDate);
    }

    // Calendar
    currentDateDisplay.addEventListener('click', () => {
        calDisplayDate = currentDate ? new Date(currentDate) : new Date();
        renderCalendar();
        calendarModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        calendarModal.classList.add('hidden');
    });

    calPrevMonth.addEventListener('click', () => {
        calDisplayDate.setMonth(calDisplayDate.getMonth() - 1);
        renderCalendar();
    });

    calNextMonth.addEventListener('click', () => {
        calDisplayDate.setMonth(calDisplayDate.getMonth() + 1);
        renderCalendar();
    });

    function renderCalendar() {
        const year = calDisplayDate.getFullYear();
        const month = calDisplayDate.getMonth();

        calMonthYear.textContent = calDisplayDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const offset = firstDay === 0 ? 6 : firstDay - 1;

        const daysContainer = calendarGrid.querySelectorAll('.cal-day');
        daysContainer.forEach(d => d.remove());

        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day disabled';
            calendarGrid.appendChild(empty);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-day';
            dayEl.textContent = i;

            if (scheduleDays.includes(dStr)) {
                dayEl.classList.add('has-class');
            } else {
                dayEl.classList.add('disabled');
            }

            if (dStr === currentDate) {
                dayEl.classList.add('active');
            }

            dayEl.addEventListener('click', () => {
                if (scheduleDays.includes(dStr)) {
                    currentDate = dStr;
                    renderScheduleForDate(currentDate);
                    calendarModal.classList.add('hidden');
                }
            });

            calendarGrid.appendChild(dayEl);
        }
    }

    // Highlight Logic
    function updateHighlights() {
        if (!currentDate || !settings.highlightCurrent) {
            document.querySelectorAll('.class-card').forEach(c => c.classList.remove('active-class'));
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        if (currentDate !== todayStr) {
            document.querySelectorAll('.class-card').forEach(c => c.classList.remove('active-class'));
            return;
        }

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        document.querySelectorAll('.class-card').forEach(card => {
            const timeDiv = card.querySelector('.class-time');
            if (!timeDiv) return;
            const timeText = timeDiv.textContent.trim();
            const [start, end] = timeText.split('-');
            if (!start || !end) return;

            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = end.split(':').map(Number);

            const startMins = sh * 60 + sm;
            const endMins = eh * 60 + em;

            if (currentMinutes >= startMins && currentMinutes <= endMins) {
                card.classList.add('active-class');
            } else {
                card.classList.remove('active-class');
            }
        });
    }

    setInterval(updateHighlights, 60000);

    // ICS Export
    exportIcsBtn.addEventListener('click', generateICS);

    function generateICS() {
        if (!currentSchedule) {
            alert("Brak harmonogramu do eksportu.");
            return;
        }

        let icsData = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//PWSZ Schedule App//PL",
            "CALSCALE:GREGORIAN"
        ];

        const now = new Date();
        const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        for (const [dateStr, classes] of Object.entries(currentSchedule)) {
            classes.forEach((cls, idx) => {
                const [start, end] = cls.time.split('-');
                if (!start || !end) return;

                const startDateStr = dateStr.replace(/-/g, '') + 'T' + start.replace(':', '') + '00';
                const endDateStr = dateStr.replace(/-/g, '') + 'T' + end.replace(':', '') + '00';
                const uid = `${startDateStr}-${idx}@pwsz.schedule`;

                icsData.push("BEGIN:VEVENT");
                icsData.push(`UID:${uid}`);
                icsData.push(`DTSTAMP:${dtstamp}`);
                icsData.push(`DTSTART:${startDateStr}`);
                icsData.push(`DTEND:${endDateStr}`);
                icsData.push(`SUMMARY:${cls.class_name}`);
                icsData.push(`LOCATION:${cls.room}`);
                icsData.push(`DESCRIPTION:${cls.teacher}`);
                icsData.push("END:VEVENT");
            });
        }

        icsData.push("END:VCALENDAR");

        const blob = new Blob([icsData.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Plan_${selectionState.subgroup || 'Zajecia'}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
});
