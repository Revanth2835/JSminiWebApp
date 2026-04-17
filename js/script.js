document.addEventListener('DOMContentLoaded', () => {
    // Set Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // =============== THEME TOGGLE ===============
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // Load saved theme
    const savedTheme = localStorage.getItem('jsTheme') || 'dark';
    setTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('jsTheme', newTheme);
        });
    }

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }
    }

    // =============== PROGRESS TRACKING ===============
    const completeBtn = document.getElementById('mark-complete-btn');
    // We expect the path format to be like "pages/beginner/variables.html", we need an ID.
    // We will use the window.location.pathname as ID, or a data-id on body.
    let lessonId = document.body.getAttribute('data-lesson-id');
    
    // Load progress
    let completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || [];
    
    // Initialize sidebar states and button
    syncProgressUI();

    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            if (!lessonId) return;
            
            if (completedLessons.includes(lessonId)) {
                completedLessons = completedLessons.filter(id => id !== lessonId);
                completeBtn.textContent = 'Mark as Complete';
                completeBtn.classList.remove('btn-outline');
                completeBtn.classList.add('btn-primary');
            } else {
                completedLessons.push(lessonId);
                completeBtn.textContent = 'Completed ✓';
                completeBtn.classList.remove('btn-primary');
                completeBtn.classList.add('btn-outline');
            }
            localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
            syncProgressUI();
        });
    }

    function syncProgressUI() {
        if (!lessonId) return;
        // Update button if on lesson page
        if (completeBtn) {
            if (completedLessons.includes(lessonId)) {
                completeBtn.textContent = 'Completed ✓';
                completeBtn.classList.remove('btn-primary');
                completeBtn.classList.add('btn-outline');
            }
        }
        
        // Update Sidebar
        const sidebarLinks = document.querySelectorAll('.sidebar-list li');
        sidebarLinks.forEach(li => {
            const link = li.querySelector('a');
            if (link) {
                // simple check using href
                const href = link.getAttribute('href');
                if (href && completedLessons.some(id => href.includes(id))) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                }
            }
        });
    }

    // =============== INTERACTIVE CODE RUNNER ===============
    const runBtns = document.querySelectorAll('.run-code-btn');
    
    runBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const runnerContainer = e.target.closest('.runner-container');
            const textarea = runnerContainer.querySelector('.runner-code');
            const outputBox = runnerContainer.querySelector('.runner-output-box');
            
            if (!textarea || !outputBox) return;
            
            const code = textarea.value;
            outputBox.innerHTML = '';
            
            // Override console.log
            const originalLog = console.log;
            let logs = [];
            console.log = function(...args) {
                const msg = args.map(arg => {
                    if (typeof arg === 'object') {
                        try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                    }
                    return String(arg);
                }).join(' ');
                logs.push(msg);
                originalLog.apply(console, args);
            };

            try {
                // Execute code safely relative to local scope
                const fn = new Function(code);
                fn();
                
                if (logs.length > 0) {
                    outputBox.innerHTML = logs.map(l => `> ${l}`).join('<br>');
                } else {
                    outputBox.innerHTML = '<span style="color:#aaa">Code executed successfully with no output. Use console.log() to print values.</span>';
                }
            } catch (err) {
                outputBox.innerHTML = `<span style="color:var(--accent-error)">> Error: ${err.message}</span>`;
            } finally {
                // Restore log
                console.log = originalLog;
            }
        });
    });
});
