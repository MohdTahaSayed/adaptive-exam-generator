// ==========================================
// 1. String Matching (CO4)
// ==========================================

function buildLPS(pattern) {
    let lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;
    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++; lps[i] = len; i++;
        } else {
            if (len !== 0) len = lps[len - 1];
            else { lps[i] = 0; i++; }
        }
    }
    return lps;
}

function kmpSearch(text, pattern) {
    if (pattern.length === 0) return true;
    let lps = buildLPS(pattern);
    let i = 0, j = 0;
    while (i < text.length) {
        if (pattern[j] === text[i]) { i++; j++; }
        if (j === pattern.length) return true;
        else if (i < text.length && pattern[j] !== text[i]) {
            if (j !== 0) j = lps[j - 1];
            else i++;
        }
    }
    return false;
}

function lcs(str1, str2) {
    let m = str1.length;
    let n = str2.length;
    let dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}

function isSimilar(q1, q2) {
    let s1 = q1.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    let s2 = q2.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    
    // KMP Exact Match
    if (s1 === s2 || kmpSearch(s1, s2) && s1.length === s2.length) {
        return { isDup: true, method: 'KMP' };
    }
    
    // LCS Similarity
    let lcsLen = lcs(s1, s2);
    let similarity = lcsLen / Math.max(s1.length, s2.length);
    
    // Strict > 85% requirement to avoid removing conceptually different strings
    if (similarity > 0.85) {
        return { isDup: true, method: 'LCS', score: similarity };
    }
    
    return { isDup: false };
}

function filterDuplicates(questions, logger) {
    let uniqueQuestions = [];
    let kmpRemoved = 0;
    let lcsRemoved = 0;
    
    for (let i = 0; i < questions.length; i++) {
        let isDup = false;
        for (let j = 0; j < uniqueQuestions.length; j++) {
            let res = isSimilar(questions[i].question, uniqueQuestions[j].question);
            if (res.isDup) {
                isDup = true;
                if (res.method === 'KMP') kmpRemoved++;
                if (res.method === 'LCS') lcsRemoved++;
                break;
            }
        }
        if (!isDup) uniqueQuestions.push(questions[i]);
    }
    
    if (kmpRemoved > 0) logger(`KMP removed ${kmpRemoved} exact duplicates`, "warn");
    if (lcsRemoved > 0) logger(`LCS removed ${lcsRemoved} highly similar questions (>85%)`, "warn");
    
    return uniqueQuestions;
}

// ==========================================
// 2. Greedy Algorithm (CO2)
// ==========================================
function greedySelection(questions, ratios, totalQuestions, logger) {
    let pool = { Easy: [], Medium: [], Hard: [] };
    questions.forEach(q => {
        if(pool[q.difficulty]) pool[q.difficulty].push(q);
    });

    let targetCounts = {
        Easy: Math.round((ratios.easy / 100) * totalQuestions),
        Medium: Math.round((ratios.medium / 100) * totalQuestions),
        Hard: Math.round((ratios.hard / 100) * totalQuestions)
    };
    
    let currentSum = targetCounts.Easy + targetCounts.Medium + targetCounts.Hard;
    while(currentSum < totalQuestions) { targetCounts.Medium++; currentSum++; }
    while(currentSum > totalQuestions) { targetCounts.Medium--; currentSum--; }

    let selected = [];
    
    for (let diff of ['Easy', 'Medium', 'Hard']) {
        let available = pool[diff];
        
        let subjectGroups = {};
        available.forEach(q => {
            if (!subjectGroups[q.subject]) subjectGroups[q.subject] = [];
            subjectGroups[q.subject].push(q);
        });
        
        let subjects = Object.keys(subjectGroups);
        let count = 0;
        let sIdx = 0;
        
        while (count < targetCounts[diff] && subjects.length > 0) {
            let currentSubject = subjects[sIdx % subjects.length];
            if (subjectGroups[currentSubject].length > 0) {
                selected.push(subjectGroups[currentSubject].pop());
                count++;
            } else {
                subjects.splice(sIdx % subjects.length, 1);
                sIdx--; 
            }
            sIdx++;
        }
    }
    
    logger("Greedy selected initial pool with balanced subjects", "success");
    return selected;
}

// ==========================================
// 3. Dynamic Programming - 0/1 Knapsack (CO3)
// ==========================================
function knapsackDP(questions, targetMarks, logger) {
    let n = questions.length;
    let dp = Array(n + 1).fill().map(() => Array(targetMarks + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        let qMarks = questions[i - 1].marks;
        for (let w = 1; w <= targetMarks; w++) {
            if (qMarks <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - qMarks] + qMarks);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    let achievedMarks = dp[n][targetMarks];
    let res = achievedMarks;
    let w = targetMarks;
    let selectedSet = [];
    
    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== dp[i - 1][w]) {
            selectedSet.push(questions[i - 1]);
            res -= questions[i - 1].marks;
            w -= questions[i - 1].marks;
        }
    }
    
    return {
        selected: selectedSet,
        marks: achievedMarks,
        exactMatch: (achievedMarks === targetMarks)
    };
}

// ==========================================
// 4. Backtracking (CO3)
// ==========================================
function solveBacktracking(pool, targetMarks, targetCount, logger) {
    let bestSubset = [];
    let bestDiff = Infinity; 
    let bestCountDiff = Infinity;
    let iterations = 0;
    const MAX_ITER = 200000;

    function backtrack(idx, currentSubset, currentMarks) {
        iterations++;
        
        let diff = Math.abs(targetMarks - currentMarks);
        let countDiff = Math.abs(targetCount - currentSubset.length);
        
        if (diff < bestDiff || (diff === bestDiff && countDiff < bestCountDiff)) {
            bestDiff = diff;
            bestCountDiff = countDiff;
            bestSubset = [...currentSubset];
        }

        if (currentMarks === targetMarks && currentSubset.length === targetCount) {
            return true;
        }

        // STRICT PRUNING
        if (currentMarks > targetMarks) return false;
        if (currentSubset.length > targetCount) return false;
        if (currentSubset.length + (pool.length - idx) < targetCount) return false;
        if (iterations > MAX_ITER) return false;
        if (idx >= pool.length) return false;

        currentSubset.push(pool[idx]);
        if (backtrack(idx + 1, currentSubset, currentMarks + pool[idx].marks)) return true;
        currentSubset.pop();

        if (backtrack(idx + 1, currentSubset, currentMarks)) return true;

        return false;
    }

    backtrack(0, [], 0);
    
    let totalMarks = bestSubset.reduce((sum, q) => sum + q.marks, 0);
    logger(`Backtracking found valid subset (${bestSubset.length} questions, ${totalMarks} marks)`, "success");
    return bestSubset;
}

// ==========================================
// 5. Divide & Conquer - Merge Sort (CO2)
// ==========================================
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    const diffVal = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

    while (i < left.length && j < right.length) {
        if (diffVal[left[i].difficulty] < diffVal[right[j].difficulty]) {
            result.push(left[i]); i++;
        } else if (diffVal[left[i].difficulty] > diffVal[right[j].difficulty]) {
            result.push(right[j]); j++;
        } else {
            if (left[i].marks <= right[j].marks) {
                result.push(left[i]); i++;
            } else {
                result.push(right[j]); j++;
            }
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}
