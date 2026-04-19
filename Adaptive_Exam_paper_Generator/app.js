document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('exam-form');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const logsContainer = document.getElementById('logs-container');
    const paperContainer = document.getElementById('paper-container');
    const printBtn = document.getElementById('print-btn');
    const regenBtn = document.getElementById('regenerate-btn');
    const genBtn = document.getElementById('generate-btn');
    const overlay = document.getElementById('loading-overlay');
    const summaryPanel = document.getElementById('summary-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    printBtn.addEventListener('click', () => {
        const element = document.getElementById('paper-container');
        html2pdf().from(element).set({
            margin: 1,
            filename: 'Adaptive_Exam_Paper.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait' }
        }).save();
    });

    function log(message, type = 'normal') {
        const div = document.createElement('div');
        div.className = 'log-entry';
        if (type === 'title') {
            div.className = 'log-title';
            div.textContent = `>> ${message}`;
        } else if (type === 'success') {
            div.classList.add('log-success');
            div.textContent = `✓ ${message}`;
        } else if (type === 'warn') {
            div.classList.add('log-warn');
            div.textContent = `! ${message}`;
        } else {
            div.textContent = message;
        }
        logsContainer.appendChild(div);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    function clearLogs() { logsContainer.innerHTML = ''; }

    function runPipeline() {
        clearLogs();
        overlay.classList.remove('hidden');
        
        // Give UI time to paint overlay
        setTimeout(() => {
            try {
                executeAlgorithms();
            } catch (e) {
                console.error(e);
                log(`Error: ${e.message}`, "warn");
            }
            overlay.classList.add('hidden');
        }, 300);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runPipeline();
        genBtn.classList.add('hidden');
        regenBtn.classList.remove('hidden');
    });

    regenBtn.addEventListener('click', () => {
        runPipeline();
    });

    function executeAlgorithms() {
        const totalMarks = parseInt(document.getElementById('total-marks').value);
        const numQuestions = parseInt(document.getElementById('num-questions').value);
        const easyRatio = parseInt(document.getElementById('easy-ratio').value);
        const mediumRatio = parseInt(document.getElementById('medium-ratio').value);
        const hardRatio = parseInt(document.getElementById('hard-ratio').value);
        const subjectInput = document.getElementById('subject').value;
        const chaptersInput = document.getElementById('chapters').value;
        const requestedChapters = chaptersInput.split(',').map(c => c.trim().toLowerCase()).filter(c => c);

        if (easyRatio + mediumRatio + hardRatio !== 100) {
            log('Difficulty ratios do not sum to 100%. Algorithms will automatically adjust.', 'warn');
        }

        log("=== INITIALIZING PIPELINE ===", "title");
        let pool = [...questionBank];
        
        if (subjectInput) {
            pool = pool.filter(q => q.subject === subjectInput);
            log(`Filtered pool by Subject: ${subjectInput}`);
        }
        if (requestedChapters.length > 0) {
            pool = pool.filter(q => requestedChapters.includes(q.chapter.toLowerCase()));
            log(`Filtered pool by Chapters: ${requestedChapters.join(', ')}`);
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        shuffleArray(pool);
        log(`Randomly shuffled dataset. Current pool size: ${pool.length}`);

        pool = filterDuplicates(pool, log);

        // We ask greedy to pick extra candidates so DP has options
        let candidatePoolSize = Math.min(pool.length, numQuestions * 3);
        let candidatePool = greedySelection(pool, {easy: easyRatio, medium: mediumRatio, hard: hardRatio}, candidatePoolSize, log); 

        let dpResult = knapsackDP(candidatePool, totalMarks, log);
        let finalQuestions = dpResult.selected;

        if (!dpResult.exactMatch || finalQuestions.length !== numQuestions) {
            if (dpResult.exactMatch) {
                log(`DP met marks but violated question count → invoking Backtracking`, "warn");
            } else {
                log(`DP could not meet exact marks constraints → invoking Backtracking`, "warn");
            }
            finalQuestions = solveBacktracking(candidatePool, totalMarks, numQuestions, log);
        } else {
            log(`DP achieved ${dpResult.marks}/${totalMarks} marks`, "success");
        }

        finalQuestions = mergeSort(finalQuestions);
        log("Merge Sort applied to organize final output", "success");

        renderPaper(finalQuestions, totalMarks, numQuestions);
        tabs[0].click(); // Switch to paper tab
        printBtn.style.display = 'block';
    }

    function renderPaper(questions, targetMarks, targetCount) {
        if (questions.length === 0) {
            paperContainer.innerHTML = '<div class="placeholder" style="color:red">Failed to generate paper. Try increasing dataset or relaxing constraints.</div>';
            summaryPanel.classList.add('hidden');
            return;
        }

        let actualMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        let actualCount = questions.length;

        // Calculate Distributions
        let diffDist = { Easy: 0, Medium: 0, Hard: 0 };
        let subjDist = {};
        questions.forEach(q => {
            diffDist[q.difficulty]++;
            subjDist[q.subject] = (subjDist[q.subject] || 0) + 1;
        });

        // Update UI Summary Panel
        summaryPanel.classList.remove('hidden');
        document.getElementById('sum-marks').innerHTML = `Marks: <strong class="${actualMarks === targetMarks ? 'satisfy-yes' : 'satisfy-no'}">${actualMarks}/${targetMarks}</strong>`;
        document.getElementById('sum-count').innerHTML = `Count: <strong class="${actualCount === targetCount ? 'satisfy-yes' : 'satisfy-no'}">${actualCount}/${targetCount}</strong>`;
        
        let diffHtml = Object.keys(diffDist).map(k => `${k}: ${Math.round((diffDist[k]/actualCount)*100)}%`).join(' | ');
        document.getElementById('sum-diff').innerHTML = `Diff: <strong>${diffHtml}</strong>`;
        
        let subjHtml = Object.keys(subjDist).map(k => `${k}: ${Math.round((subjDist[k]/actualCount)*100)}%`).join(' | ');
        document.getElementById('sum-subj').innerHTML = `Subj: <strong>${subjHtml}</strong>`;

        let html = `
            <div class="exam-header">
                <h2>Generated Examination Paper</h2>
                <p><strong>Total Marks:</strong> ${actualMarks} | <strong>Questions:</strong> ${actualCount} | <strong>Time:</strong> 3 Hours</p>
            </div>
        `;

        let currentSection = '';
        let qNum = 1;

        questions.forEach(q => {
            if (q.difficulty !== currentSection) {
                currentSection = q.difficulty;
                let sectionLabel = currentSection === 'Easy' ? 'Section A' : currentSection === 'Medium' ? 'Section B' : 'Section C';
                html += `
                    <div class="section-title">
                        <span>${sectionLabel}</span>
                        <span class="badge ${currentSection.toLowerCase()}">${currentSection} Questions</span>
                    </div>
                `;
            }

            html += `
                <div class="question-item">
                    <div class="q-text"><strong>Q${qNum}.</strong> ${q.question}
                        <br>
                        <span class="badge subj">${q.subject} • ${q.chapter}</span>
                    </div>
                    <div class="q-meta">[${q.marks} Marks]</div>
                </div>
            `;
            qNum++;
        });

        paperContainer.innerHTML = html;
        log("=== EXAM GENERATION COMPLETE ===", "title");
    }
});
