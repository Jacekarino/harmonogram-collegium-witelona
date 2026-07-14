document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const navMenuBtn = document.getElementById('nav-menu-btn');

    const panelOverlay = document.getElementById('panel-overlay');
    const menuPanel = document.getElementById('menu-panel');
    const pickerPanel = document.getElementById('picker-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const aboutPanel = document.getElementById('about-panel');
    const filterPanel = document.getElementById('filter-panel');
    const progressPanel = document.getElementById('progress-panel');

    const menuPickerBtn = document.getElementById('menu-picker-btn');
    const menuFilterBtn = document.getElementById('menu-filter-btn');
    const menuProgressBtn = document.getElementById('menu-progress-btn');
    const menuSettingsBtn = document.getElementById('menu-settings-btn');
    const menuAboutBtn = document.getElementById('menu-about-btn');
    const closeBtns = document.querySelectorAll('.close-panel-btn');

    const toggleDarkMode = document.getElementById('toggle-dark-mode');
    const toggleCompactMode = document.getElementById('toggle-compact-mode');
    const toggleAutoSkip = document.getElementById('toggle-auto-skip');
    const toggleHighlightCurrent = document.getElementById('toggle-highlight-current');
    const toggleShowGaps = document.getElementById('toggle-show-gaps');
    const toggleStrikePast = document.getElementById('toggle-strike-past');
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
    const welcomeModal = document.getElementById('welcome-modal');
    const closeWelcomeBtn = document.getElementById('close-welcome-btn');
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
        compactMode: false,
        strikePast: false,
        showGaps: true,
        autoSkip: true,
        highlightCurrent: true,
    };

    // Init
    loadSettings();
    loadSavedPath();
    fetchFaculties();

    // Welcome Pop Up for new users
    if (!localStorage.getItem('welcomeShown')) {
        welcomeModal.classList.remove('hidden');
    }

    function closeWelcomeModal() {
        welcomeModal.classList.add('hidden');
        localStorage.setItem('welcomeShown', 'true');
    }

    closeWelcomeBtn.addEventListener('click', closeWelcomeModal);
    welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) {
            closeWelcomeModal();
        }
    });

    // Panel Logic
    function openPanel(panel) {
        document.body.classList.add('panel-open');
        panelOverlay.classList.remove('hidden');
        panel.classList.remove('hidden');
        setTimeout(() => panel.classList.add('open'), 10);
    }

    function closeAllPanels() {
        document.body.classList.remove('panel-open');
        menuPanel.classList.remove('open');
        pickerPanel.classList.remove('open');
        settingsPanel.classList.remove('open');
        aboutPanel.classList.remove('open');
        filterPanel.classList.remove('open');
        progressPanel.classList.remove('open');
        setTimeout(() => {
            menuPanel.classList.add('hidden');
            pickerPanel.classList.add('hidden');
            settingsPanel.classList.add('hidden');
            aboutPanel.classList.add('hidden');
            filterPanel.classList.add('hidden');
            progressPanel.classList.add('hidden');
            panelOverlay.classList.add('hidden');
        }, 300);
    }

    navMenuBtn.addEventListener('click', () => {
        if (menuPanel.classList.contains('open')) {
            closeAllPanels();
        } else {
            openPanel(menuPanel);
        }
    });

    menuPickerBtn.addEventListener('click', () => {
        updateAccordionLockStates();
        openPanel(pickerPanel);
    });
    menuSettingsBtn.addEventListener('click', () => openPanel(settingsPanel));
    menuAboutBtn.addEventListener('click', () => openPanel(aboutPanel));
    menuFilterBtn.addEventListener('click', () => {
        updateFilterPanel();
        openPanel(filterPanel);
    });
    menuProgressBtn.addEventListener('click', () => {
        updateSemesterProgress();
        openPanel(progressPanel);
    });

    panelOverlay.addEventListener('click', closeAllPanels);
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            targetPanel.classList.remove('open');

            const remainingOpen = Array.from(document.querySelectorAll('.side-panel.open'))
                .filter(p => p !== targetPanel);
            if (remainingOpen.length === 0) {
                document.body.classList.remove('panel-open');
            }

            setTimeout(() => {
                targetPanel.classList.add('hidden');
                const openPanels = document.querySelectorAll('.side-panel.open');
                if (openPanels.length === 0) {
                    panelOverlay.classList.add('hidden');
                }
            }, 300);
        });
    });

    // Accordion step click handler
    const accordionSteps = [stepFaculty, stepSpec, stepYear, stepCode, stepSubgroup];
    accordionSteps.forEach((step, index) => {
        const summary = step.querySelector('summary');
        if (summary) {
            summary.addEventListener('click', () => {
                if (!step.hasAttribute('open')) {

                    // Reset subsequent selection states
                    if (index === 0) {
                        selectionState.faculty = null;
                        selectionState.specName = null;
                        selectionState.year = null;
                        selectionState.code = null;
                        selectionState.subgroup = null;
                    } else if (index === 1) {
                        selectionState.specName = null;
                        selectionState.year = null;
                        selectionState.code = null;
                        selectionState.subgroup = null;
                    } else if (index === 2) {
                        selectionState.year = null;
                        selectionState.code = null;
                        selectionState.subgroup = null;
                    } else if (index === 3) {
                        selectionState.code = null;
                        selectionState.subgroup = null;
                    } else if (index === 4) {
                        selectionState.subgroup = null;
                    }
                    savePath();

                    // Collapse all other steps
                    accordionSteps.forEach((s, idx) => {
                        if (idx !== index) {
                            s.removeAttribute('open');
                        }
                    });

                    updateAccordionLockStates();
                }
            });
        }
    });

    // Settings Logic
    function loadSettings() {
        const savedSettings = localStorage.getItem('pwszSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        applySettings();
    }

    function saveSettings() {
        localStorage.setItem('pwszSettings', JSON.stringify(settings));
        applySettings();
        if (currentSchedule) {
            renderScheduleForDate(currentDate);
            updateFilterPanel();
            updateSemesterProgress();
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
        toggleCompactMode.checked = settings.compactMode;
        toggleAutoSkip.checked = settings.autoSkip;
        toggleHighlightCurrent.checked = settings.highlightCurrent;
        toggleShowGaps.checked = settings.showGaps;
        toggleStrikePast.checked = settings.strikePast;
        updateHighlights();
    }

    toggleDarkMode.addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        saveSettings();
    });

    toggleCompactMode.addEventListener('change', (e) => {
        settings.compactMode = e.target.checked;
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

    toggleShowGaps.addEventListener('change', (e) => {
        settings.showGaps = e.target.checked;
        saveSettings();
    });

    toggleStrikePast.addEventListener('change', (e) => {
        settings.strikePast = e.target.checked;
        saveSettings();
    });

    function formatRoom(room) {
        if (!room) return '?';
        const r = room.trim();
        if (r.toLowerCase().startsWith('inne_') || r.toLowerCase() === 'inne') {
            return '?';
        }
        return r;
    }

    // 1h [x/-] & 1h [-/x] fixes
    function adjustHalfClassTime(timeStr, type) {
        const parts = timeStr.split('-');
        if (parts.length !== 2) return timeStr;
        const [startStr, endStr] = parts.map(p => p.trim());

        const [sh, sm] = startStr.split(':').map(Number);
        const [eh, em] = endStr.split(':').map(Number);
        if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return timeStr;

        const startMins = sh * 60 + sm;
        const endMins = eh * 60 + em;

        let newStartMins = startMins;
        let newEndMins = endMins;

        if (type === 'first') {
            newEndMins = startMins + 45;
        } else if (type === 'second') {
            newStartMins = startMins + 45;
        }

        const formatTime = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        return `${formatTime(newStartMins)}-${formatTime(newEndMins)}`;
    }

    function processHalfClass(cls) {
        if (!cls.class_name) return;

        const firstHalfRegex = /\s*1h\s*\[x\/-\]/i;
        const secondHalfRegex = /\s*1h\s*\[-\/x\]/i;

        let type = null;
        if (firstHalfRegex.test(cls.class_name)) {
            type = 'first';
        } else if (secondHalfRegex.test(cls.class_name)) {
            type = 'second';
        }

        if (type) {
            cls.time = adjustHalfClassTime(cls.time, type);
            cls.class_name = cls.class_name.replace(firstHalfRegex, '').replace(secondHalfRegex, '').trim();
            if (cls.short_name) {
                cls.short_name = cls.short_name.replace(firstHalfRegex, '').replace(secondHalfRegex, '').trim();
            }
            cls.isHalfClass = true;
        }
    }
    function getClassType(className) {
        const lowerName = className.toLowerCase();
        if (lowerName.includes('(wyk') || lowerName.includes('wykład')) {
            return 'wykład';
        }
        if (lowerName.includes('(ćw') || lowerName.includes('ćwiczenia')) {
            return 'ćwiczenia';
        }
        if (lowerName.includes('(lab') || lowerName.includes('laboratori')) {
            return 'laboratorium';
        }
        if (lowerName.includes('(p)') || lowerName.includes('projekt')) {
            return 'projekt';
        }
        if (lowerName.includes('(sem') || lowerName.includes('seminarium')) {
            return 'seminarium';
        }
        if (lowerName.includes('(wt') || lowerName.includes('warsztat')) {
            return 'warsztaty';
        }
        if (lowerName.includes('(lek') || lowerName.includes('lektorat')) {
            return 'lektoraty';
        }
        return 'inne';
    }

    function cleanClassName(className) {
        if (!className) return '';
        return className.replace(/\s*\((wyk|ćw|lab|p|sem|wt|lek|wykład|ćwiczenia|laboratorium|projekt|seminarium|warsztaty|lektoraty)\)/gi, '').trim();
    }

    function isInstancePast(dateStr, timeStr) {
        if (!dateStr || !timeStr) return false;
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr < todayStr) return true;
        if (dateStr > todayStr) return false;

        const parts = timeStr.split('-');
        if (parts.length !== 2) return false;
        const endStr = parts[1].trim();
        const endParts = endStr.split(':').map(Number);
        if (endParts.length !== 2) return false;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const endMins = endParts[0] * 60 + endParts[1];
        return currentMinutes > endMins;
    }

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
        updateAccordionLockStates();
    }

    function updateAccordionLockStates() {
        const steps = [
            { el: stepFaculty, grid: gridFaculty, unlocked: true },
            { el: stepSpec, grid: gridSpec, unlocked: !!selectionState.faculty },
            { el: stepYear, grid: gridYear, unlocked: !!selectionState.specName },
            { el: stepCode, grid: gridCode, unlocked: !!selectionState.year },
            { el: stepSubgroup, grid: gridSubgroup, unlocked: !!selectionState.code }
        ];

        steps.forEach(step => {
            if (step.unlocked) {
                step.el.classList.remove('locked');
            } else {
                step.el.classList.add('locked');
                step.el.removeAttribute('open');
                if (step.grid) {
                    step.grid.innerHTML = '';
                }
            }
        });
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
            facultiesData = data.faculties.filter(f => {
                const name = f.faculty_name.toLowerCase();
                return !name.includes("erasmus") && !name.includes("wrocław");
            });

            buildFacultyGrid();

            if (selectionState.faculty) {
                const fac = facultiesData.find(f => f.faculty_name === selectionState.faculty.faculty_name);
                if (fac) {
                    selectionState.faculty = fac;
                    buildSpecGrid();
                    if (selectionState.specName) {
                        buildYearGrid();
                        if (selectionState.year) {
                            buildCodeGrid();
                            if (selectionState.code) {
                                await fetchSubgroups();
                                if (selectionState.subgroup) {
                                    await fetchSchedule();
                                    return;
                                }
                            }
                        }
                    }
                } else {
                    selectionState = {
                        faculty: null,
                        specName: null,
                        year: null,
                        code: null,
                        subgroup: null
                    };
                    savePath();
                }
            }

            updateAccordionLockStates();
            openPanel(pickerPanel);
        } catch (e) {
            console.error("Failed to load faculties", e);
        }
    }

    function buildFacultyGrid() {
        gridFaculty.innerHTML = '';
        const sortedFaculties = [...facultiesData].sort((a, b) => a.faculty_name.localeCompare(b.faculty_name, 'pl'));
        sortedFaculties.forEach(fac => {
            const btn = createPickBtn(fac.faculty_name, () => {
                selectionState.faculty = fac;
                selectionState.specName = null;
                selectionState.year = null;
                selectionState.code = null;
                selectionState.subgroup = null;
                savePath();
                updatePickerButtons(gridFaculty, btn);
                buildSpecGrid();
            });
            if (selectionState.faculty && fac.faculty_name === selectionState.faculty.faculty_name) {
                btn.classList.add('active');
            }
            gridFaculty.appendChild(btn);
        });

        if (facultiesData.length === 1) {
            const onlyFac = facultiesData[0];
            selectionState.faculty = onlyFac;
            gridFaculty.querySelector('.pick-btn').classList.add('active');
            savePath();
            buildSpecGrid();
        }
    }

    function buildSpecGrid() {
        gridSpec.innerHTML = '';
        gridYear.innerHTML = '';
        gridCode.innerHTML = '';
        gridSubgroup.innerHTML = '';

        const specs = selectionState.faculty.specializations;
        const uniqueNames = [...new Set(specs.map(s => s.name))].sort((a, b) => a.localeCompare(b, 'pl'));

        uniqueNames.forEach(name => {
            const btn = createPickBtn(name, () => {
                selectionState.specName = name;
                selectionState.year = null;
                selectionState.code = null;
                selectionState.subgroup = null;
                savePath();
                updatePickerButtons(gridSpec, btn);
                buildYearGrid();
            });
            if (selectionState.specName === name) btn.classList.add('active');
            gridSpec.appendChild(btn);
        });

        if (uniqueNames.length === 1) {
            selectionState.specName = uniqueNames[0];
            gridSpec.querySelector('.pick-btn').classList.add('active');
            savePath();
            buildYearGrid();
        } else {
            openAccordionStep(stepSpec);
        }
    }

    function buildYearGrid() {
        gridYear.innerHTML = '';
        gridCode.innerHTML = '';
        gridSubgroup.innerHTML = '';

        const specs = selectionState.faculty.specializations.filter(s => s.name === selectionState.specName);
        const uniqueYears = [...new Set(specs.map(s => s.year))].sort((a, b) => String(a).localeCompare(String(b), 'pl'));

        uniqueYears.forEach(year => {
            const btn = createPickBtn(year, () => {
                selectionState.year = year;
                selectionState.code = null;
                selectionState.subgroup = null;
                savePath();
                updatePickerButtons(gridYear, btn);
                buildCodeGrid();
            });
            if (selectionState.year === year) btn.classList.add('active');
            gridYear.appendChild(btn);
        });

        if (uniqueYears.length === 1) {
            selectionState.year = uniqueYears[0];
            gridYear.querySelector('.pick-btn').classList.add('active');
            savePath();
            buildCodeGrid();
        } else {
            openAccordionStep(stepYear);
        }
    }

    function buildCodeGrid() {
        gridCode.innerHTML = '';
        gridSubgroup.innerHTML = '';

        const specs = selectionState.faculty.specializations.filter(s => s.name === selectionState.specName && s.year === selectionState.year);
        const sortedSpecs = [...specs].sort((a, b) => a.code.localeCompare(b.code, 'pl'));

        sortedSpecs.forEach(spec => {
            const btn = createPickBtn(spec.code, () => {
                selectionState.code = spec.code;
                selectionState.subgroup = null;
                savePath();
                updatePickerButtons(gridCode, btn);
                fetchSubgroups();
            });
            if (selectionState.code === spec.code) btn.classList.add('active');
            gridCode.appendChild(btn);
        });

        if (specs.length === 1) {
            selectionState.code = specs[0].code;
            gridCode.querySelector('.pick-btn').classList.add('active');
            savePath();
            fetchSubgroups();
        } else {
            openAccordionStep(stepCode);
        }
    }

    async function fetchSubgroups() {
        gridSubgroup.innerHTML = '<i>Ładowanie...</i>';

        try {
            const path = getPath();
            const res = await fetch(`data/${path}/subgroups.json`);
            if (!res.ok) throw new Error("No subgroups");
            const subgroups = await res.json();
            const sortedSubgroups = [...subgroups].sort((a, b) => a.localeCompare(b, 'pl'));

            gridSubgroup.innerHTML = '';
            sortedSubgroups.forEach(sg => {
                const btn = createPickBtn(sg, () => {
                    selectionState.subgroup = sg;
                    updatePickerButtons(gridSubgroup, btn);
                    savePath();
                    closeAllPanels();
                    fetchSchedule();
                });
                if (selectionState.subgroup === sg) btn.classList.add('active');
                gridSubgroup.appendChild(btn);
            });

            if (subgroups.length === 1) {
                selectionState.subgroup = subgroups[0];
                gridSubgroup.querySelector('.pick-btn').classList.add('active');
                savePath();
                closeAllPanels();
                fetchSchedule();
            } else {
                openAccordionStep(stepSubgroup);
            }
        } catch (e) {
            openAccordionStep(stepSubgroup);
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
                    classes.forEach(cls => {
                        processHalfClass(cls);
                    });
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
            updateSemesterProgress();
            updateFilterPanel();

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

        // Helper to parse class times
        function parseClassTime(timeStr) {
            const parts = timeStr.split('-');
            if (parts.length !== 2) return null;
            const [startStr, endStr] = parts.map(p => p.trim());
            const startParts = startStr.split(':').map(Number);
            const endParts = endStr.split(':').map(Number);
            if (startParts.length !== 2 || endParts.length !== 2) return null;
            return {
                startMins: startParts[0] * 60 + startParts[1],
                endMins: endParts[0] * 60 + endParts[1],
                startStr,
                endStr
            };
        }

        // Helper to check if class has already passed
        function isClassPast(timeInfo) {
            if (!timeInfo) return false;
            const todayStr = new Date().toISOString().split('T')[0];
            if (dateStr < todayStr) return true;
            if (dateStr > todayStr) return false;
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            return currentMinutes > timeInfo.endMins;
        }

        let classes = [...currentSchedule[dateStr]].sort((a, b) => {
            const timeA = parseClassTime(a.time);
            const timeB = parseClassTime(b.time);
            if (!timeA || !timeB) return 0;
            return timeA.startMins - timeB.startMins;
        });

        classesList.innerHTML = '';
        let prevEndMins = null;
        let prevEndStr = null;

        classes.forEach(cls => {
            const timeInfo = parseClassTime(cls.time);

            if (settings.showGaps && prevEndMins !== null && timeInfo !== null) {
                const gapMinutes = timeInfo.startMins - prevEndMins;
                if (gapMinutes > 20) {
                    const gapTimeInfo = { endMins: timeInfo.startMins };
                    const isGapPast = isClassPast(gapTimeInfo);
                    const gapPastClass = (settings.strikePast && isGapPast) ? ' past-class' : '';

                    const gapCard = document.createElement('div');

                    const hours = Math.floor(gapMinutes / 60);
                    const mins = gapMinutes % 60;
                    let durationText = '';
                    if (hours > 0) {
                        durationText = `${hours} godz.${mins > 0 ? ` ${mins} min.` : ''}`;
                    } else {
                        durationText = `${mins} min.`;
                    }

                    if (settings.compactMode) {
                        gapCard.className = `class-card class-gap compact-card${gapPastClass}`;
                        gapCard.innerHTML = `
                            <div class="compact-line">
                                <span class="time-item">${prevEndStr}</span>
                                <span class="room-item">—</span>
                            </div>
                        `;
                    } else {
                        gapCard.className = `class-card class-gap${gapPastClass}`;
                        gapCard.innerHTML = `
                            <div class="class-time">
                                <span class="time-item">
                                    <svg class="icon icon-clock" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span>${prevEndStr} - ${timeInfo.startStr}</span>
                                </span>
                            </div>
                            <div class="class-details">
                                <div class="class-name">
                                    <svg class="icon icon-coffee" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                                    <span>Okienko (${durationText})</span>
                                </div>
                            </div>
                        `;
                    }
                    classesList.appendChild(gapCard);
                }
            }

            if (timeInfo) {
                prevEndMins = timeInfo.endMins;
                prevEndStr = timeInfo.endStr;
            }

            const isPast = isClassPast(timeInfo);
            const pastClass = (settings.strikePast && isPast) ? ' past-class' : '';

            const card = document.createElement('div');

            if (timeInfo) {
                card.setAttribute('data-start-mins', timeInfo.startMins);
                card.setAttribute('data-end-mins', timeInfo.endMins);
            }

            const displayName = settings.compactMode && cls.short_name ? cls.short_name : cls.class_name;
            const isOnline = cls.room && cls.room.toLowerCase().includes('online');
            const roomText = isOnline ? 'Online' : formatRoom(cls.room);

            if (settings.compactMode) {
                card.className = `class-card compact-card${pastClass}`;
                const startTime = cls.time.split('-')[0].trim();
                const timeDisplay = cls.isHalfClass ? `${startTime} (!)` : startTime;
                card.innerHTML = `
                    <div class="compact-line">
                        <span class="time-item">${timeDisplay}</span>
                        <span class="room-item">${roomText}</span>
                        <span class="class-name">${displayName}</span>
                    </div>
                `;
            } else {
                card.className = `class-card${pastClass}`;
                const roomHtml = isOnline ? `
                    <span class="room-item">
                        <svg class="icon icon-globe" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <span>Online</span>
                    </span>
                ` : `
                    <span class="room-item">
                        <svg class="icon icon-pin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span> ${formatRoom(cls.room)}</span>
                    </span>
                `;

                card.innerHTML = `
                    <div class="class-time">
                        <span class="time-item">
                            <svg class="icon icon-clock" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${cls.isHalfClass ? `${cls.time} (!)` : cls.time}</span>
                        </span>
                        ${roomHtml}
                    </div>
                    <div class="class-details">
                        <div class="class-name">
                            <svg class="icon icon-book" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            <span>${displayName}</span>
                        </div>
                        <div class="class-teacher">
                            <svg class="icon icon-user" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>${cls.teacher}</span>
                        </div>
                    </div>
                `;
            }
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

    calendarModal.addEventListener('click', (e) => {
        if (e.target === calendarModal) {
            calendarModal.classList.add('hidden');
        }
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
            if (card.classList.contains('class-gap')) {
                card.classList.remove('active-class');
                return;
            }
            const startMinsAttr = card.getAttribute('data-start-mins');
            const endMinsAttr = card.getAttribute('data-end-mins');
            if (!startMinsAttr || !endMinsAttr) return;

            const startMins = Number(startMinsAttr);
            const endMins = Number(endMinsAttr);

            if (currentMinutes >= startMins && currentMinutes <= endMins) {
                card.classList.add('active-class');
            } else {
                card.classList.remove('active-class');
            }
        });
    }

    function updateSemesterProgress() {
        const progressPanelContent = document.getElementById('progress-panel-content');
        if (!progressPanelContent) return;

        if (!currentSchedule || Object.keys(currentSchedule).length === 0) {
            progressPanelContent.innerHTML = `
                <div class="empty-panel-state">
                    <p class="empty-panel-desc">Wybierz najpierw grupę, aby zobaczyć postęp semestru.</p>
                </div>
            `;
            return;
        }

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let totalClassesCount = 0;
        let passedClassesCount = 0;

        const categories = {
            'wykład': {},
            'ćwiczenia': {},
            'laboratorium': {},
            'projekt': {},
            'seminarium': {},
            'warsztaty': {},
            'lektoraty': {},
            'inne': {}
        };

        const categoryLabels = {
            'wykład': 'Wykłady',
            'ćwiczenia': 'Ćwiczenia',
            'laboratorium': 'Laboratoria',
            'projekt': 'Projekty',
            'seminarium': 'Seminaria',
            'warsztaty': 'Warsztaty',
            'lektoraty': 'Lektoraty',
            'inne': 'Inne'
        };

        for (const [dateStr, classes] of Object.entries(currentSchedule)) {
            classes.forEach(cls => {
                totalClassesCount++;

                let hasPassed = false;
                if (dateStr < todayStr) {
                    hasPassed = true;
                } else if (dateStr > todayStr) {
                    hasPassed = false;
                } else {
                    const parts = cls.time.split('-');
                    if (parts.length === 2) {
                        const endStr = parts[1].trim();
                        const endParts = endStr.split(':').map(Number);
                        if (endParts.length === 2) {
                            const endMins = endParts[0] * 60 + endParts[1];
                            hasPassed = currentMinutes > endMins;
                        }
                    }
                }

                if (hasPassed) {
                    passedClassesCount++;
                }

                const rawName = cls.class_name;
                const cat = getClassType(rawName);
                const cName = cleanClassName(rawName);

                if (!categories[cat][cName]) {
                    categories[cat][cName] = { total: 0, passed: 0 };
                }
                categories[cat][cName].total++;
                if (hasPassed) {
                    categories[cat][cName].passed++;
                }
            });
        }

        const overallPercentage = totalClassesCount > 0 ? Math.round((passedClassesCount / totalClassesCount) * 100) : 0;

        let html = `
            <div class="progress-section">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${overallPercentage}%">
                        <span class="progress-bar-text">${passedClassesCount} / ${totalClassesCount} (${overallPercentage}%)</span>
                    </div>
                </div>
            </div>
            <div class="progress-list-section">
        `;

        const categoryOrder = ['wykład', 'ćwiczenia', 'laboratorium', 'projekt', 'seminarium', 'warsztaty', 'lektoraty', 'inne'];

        categoryOrder.forEach(cat => {
            const catClasses = categories[cat];
            const classNames = Object.keys(catClasses);
            if (classNames.length === 0) return;

            classNames.sort();

            html += `
                <div class="progress-category-group">
                    <h2 class="progress-category-title">${categoryLabels[cat]}</h2>
                    <div class="progress-classes-list">
            `;

            classNames.forEach(cName => {
                const stats = catClasses[cName];
                const pct = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
                html += `
                    <div class="progress-class-row">
                        <div class="progress-class-info">
                            <span class="progress-class-name">${cName}</span>
                            <span class="progress-class-counter">${stats.passed} / ${stats.total} (${pct}%)</span>
                        </div>
                        <div class="progress-class-bar-mini">
                            <div class="progress-class-bar-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
            </div>
        `;

        progressPanelContent.innerHTML = html;
    }

    function updateFilterPanel() {
        const filterPanelContent = document.getElementById('filter-panel-content');
        if (!filterPanelContent) return;

        if (!currentSchedule || Object.keys(currentSchedule).length === 0) {
            filterPanelContent.innerHTML = `
                <div class="empty-panel-state">
                    <p class="empty-panel-desc">Wybierz najpierw grupę, aby zobaczyć filtry zajęć.</p>
                </div>
            `;
            return;
        }

        const categories = {
            'wykład': {},
            'ćwiczenia': {},
            'laboratorium': {},
            'projekt': {},
            'seminarium': {},
            'warsztaty': {},
            'lektoraty': {},
            'inne': {}
        };

        const categoryLabels = {
            'wykład': 'Wykłady',
            'ćwiczenia': 'Ćwiczenia',
            'laboratorium': 'Laboratoria',
            'projekt': 'Projekty',
            'seminarium': 'Seminaria',
            'warsztaty': 'Warsztaty',
            'lektoraty': 'Lektoraty',
            'inne': 'Inne'
        };

        for (const [dateStr, classes] of Object.entries(currentSchedule)) {
            classes.forEach(cls => {
                const rawName = cls.class_name;
                const cat = getClassType(rawName);
                const cName = cleanClassName(rawName);

                if (!categories[cat][cName]) {
                    categories[cat][cName] = {
                        instances: [],
                        shortName: cleanClassName(cls.short_name) || cName
                    };
                }
                categories[cat][cName].instances.push({
                    dateStr,
                    time: cls.time,
                    room: cls.room,
                    isHalfClass: cls.isHalfClass
                });
            });
        }

        for (const cat of Object.keys(categories)) {
            for (const cName of Object.keys(categories[cat])) {
                categories[cat][cName].instances.sort((a, b) => {
                    if (a.dateStr !== b.dateStr) {
                        return a.dateStr.localeCompare(b.dateStr);
                    }
                    const [startA] = a.time.split('-');
                    const [startB] = b.time.split('-');
                    return startA.localeCompare(startB);
                });
            }
        }

        filterPanelContent.innerHTML = '';

        const categoryOrder = ['wykład', 'ćwiczenia', 'laboratorium', 'projekt', 'seminarium', 'warsztaty', 'lektoraty', 'inne'];
        const outerAccordionDiv = document.createElement('div');
        outerAccordionDiv.className = 'accordion filter-outer-accordion';
        const topLevelDetails = [];

        categoryOrder.forEach(cat => {
            const catClasses = categories[cat];
            const classNames = Object.keys(catClasses);
            if (classNames.length === 0) return;

            classNames.sort((a, b) => {
                const nameA = settings.compactMode ? catClasses[a].shortName : a;
                const nameB = settings.compactMode ? catClasses[b].shortName : b;
                return nameA.localeCompare(nameB);
            });

            const catDetails = document.createElement('details');
            catDetails.className = 'acc-step category-step';

            const catSummary = document.createElement('summary');
            catSummary.textContent = categoryLabels[cat];
            catDetails.appendChild(catSummary);

            const catContentDiv = document.createElement('div');
            catContentDiv.className = 'acc-content category-content';

            const innerAccordionDiv = document.createElement('div');
            innerAccordionDiv.className = 'accordion filter-inner-accordion';

            const catInnerDetails = [];

            classNames.forEach(cName => {
                const catData = catClasses[cName];
                const instances = catData.instances;
                const displayName = settings.compactMode ? catData.shortName : cName;

                const details = document.createElement('details');
                details.className = 'acc-step filter-step';

                const summary = document.createElement('summary');
                summary.textContent = displayName;
                details.appendChild(summary);

                const contentDiv = document.createElement('div');
                contentDiv.className = 'acc-content filter-instances-list';

                let listHtml = `<ul class="instance-list">`;
                instances.forEach(inst => {
                    const dateObj = new Date(inst.dateStr);
                    const dateFormatted = dateObj.toLocaleDateString('pl-PL', { weekday: 'long', month: 'long', day: 'numeric' });
                    const isOnline = inst.room && inst.room.toLowerCase().includes('online');
                    const roomLabel = isOnline ? 'Online' : formatRoom(inst.room);
                    const isPast = isInstancePast(inst.dateStr, inst.time);
                    const pastClass = (settings.strikePast && isPast) ? ' past-class' : '';

                    listHtml += `
                        <li class="instance-item${pastClass}">
                            <div class="instance-meta">
                                <span class="instance-date">${dateFormatted}</span>
                                <span class="instance-time">${inst.isHalfClass ? `${inst.time} (!)` : inst.time}</span>
                            </div>
                            <span class="instance-room">${roomLabel}</span>
                        </li>
                    `;
                });
                listHtml += `</ul>`;

                contentDiv.innerHTML = listHtml;
                details.appendChild(contentDiv);

                details.addEventListener('toggle', (e) => {
                    if (details.open) {
                        catInnerDetails.forEach(d => {
                            if (d !== details) d.removeAttribute('open');
                        });
                    }
                });

                catInnerDetails.push(details);
                innerAccordionDiv.appendChild(details);
            });

            catContentDiv.appendChild(innerAccordionDiv);
            catDetails.appendChild(catContentDiv);

            topLevelDetails.push(catDetails);
            outerAccordionDiv.appendChild(catDetails);
        });

        topLevelDetails.forEach(details => {
            details.addEventListener('toggle', (e) => {
                if (details.open) {
                    topLevelDetails.forEach(d => {
                        if (d !== details) d.removeAttribute('open');
                    });
                }
            });
        });

        filterPanelContent.appendChild(outerAccordionDiv);
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
