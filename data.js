const questionBank = [];
let idCounter = 1;

function addQuestions(subject, chapter, templates, termsArr) {
    termsArr.forEach(term => {
        templates.forEach(temp => {
            let questionText = temp.t.replace("{X}", term);
            if (questionText.includes("{Y}")) {
                let otherTerm = termsArr[(termsArr.indexOf(term) + 1) % termsArr.length];
                questionText = questionText.replace("{Y}", otherTerm);
            }
            questionBank.push({
                id: "q_" + idCounter++,
                question: questionText,
                subject: subject,
                chapter: chapter,
                difficulty: temp.diff,
                marks: temp.marks,
                type: temp.marks > 2 ? "Long" : "Short"
            });
        });
    });
}

// Computer Science
addQuestions("Computer Science", "Algorithms", [
    { t: "Analyze the time complexity of {X}.", diff: "Hard", marks: 10 },
    { t: "Write a pseudocode implementation for {X}.", diff: "Medium", marks: 5 },
    { t: "What is the primary use case of {X}?", diff: "Easy", marks: 2 },
    { t: "Compare the performance of {X} with {Y} in the worst case.", diff: "Hard", marks: 10 },
    { t: "Briefly explain how {X} operates.", diff: "Medium", marks: 5 }
], ["Merge Sort", "Quick Sort", "Dijkstra's Algorithm"]);

addQuestions("Computer Science", "DBMS", [
    { t: "Discuss the importance of {X} in relational databases.", diff: "Medium", marks: 5 },
    { t: "Define {X} with a clear example.", diff: "Easy", marks: 2 },
    { t: "How does {X} improve data integrity?", diff: "Medium", marks: 5 },
    { t: "Explain the process of achieving {X} from a non-normalized schema.", diff: "Hard", marks: 10 },
    { t: "Differentiate between {X} and {Y}.", diff: "Hard", marks: 10 }
], ["3NF Normalization", "ACID Properties", "Foreign Key Constraints"]);

// Physics
addQuestions("Physics", "Mechanics", [
    { t: "Derive the mathematical expression for {X}.", diff: "Hard", marks: 10 },
    { t: "State the law governing {X}.", diff: "Easy", marks: 2 },
    { t: "Explain the conservation principle related to {X}.", diff: "Medium", marks: 5 },
    { t: "Calculate the expected value of {X} given standard mass and velocity.", diff: "Medium", marks: 5 },
    { t: "How does friction impact {X}?", diff: "Hard", marks: 10 }
], ["Kinetic Energy", "Linear Momentum", "Projectile Trajectory"]);

addQuestions("Physics", "Electromagnetism", [
    { t: "Describe the underlying physics of {X}.", diff: "Medium", marks: 5 },
    { t: "What is the fundamental formula for {X}?", diff: "Easy", marks: 2 },
    { t: "Analyze a circuit demonstrating {X}.", diff: "Hard", marks: 10 },
    { t: "Explain how {X} differs from {Y} in a magnetic field.", diff: "Hard", marks: 10 },
    { t: "Provide a real-world application of {X}.", diff: "Medium", marks: 5 }
], ["Faraday's Law", "Lenz's Law", "Magnetic Flux"]);

// Mathematics
addQuestions("Mathematics", "Calculus", [
    { t: "Evaluate the definite integral of {X} from 0 to 1.", diff: "Hard", marks: 10 },
    { t: "Find the first derivative of {X} with respect to x.", diff: "Medium", marks: 5 },
    { t: "State the rule used to differentiate {X}.", diff: "Easy", marks: 2 },
    { t: "Determine the local maxima and minima for {X}.", diff: "Hard", marks: 10 },
    { t: "Sketch the graph of the function {X}.", diff: "Medium", marks: 5 }
], ["x^3 * e^x", "sin(x^2)", "ln(x) + x^2"]);

addQuestions("Mathematics", "Linear Algebra", [
    { t: "Compute the determinant of the matrix associated with {X}.", diff: "Medium", marks: 5 },
    { t: "Prove that {X} forms a basis for R^3.", diff: "Hard", marks: 10 },
    { t: "What is meant by {X} in the context of vector spaces?", diff: "Easy", marks: 2 },
    { t: "Find the eigenvalues for the system defined by {X}.", diff: "Hard", marks: 10 },
    { t: "Explain the geometric interpretation of {X}.", diff: "Medium", marks: 5 }
], ["a set of orthogonal vectors", "a linear transformation matrix", "an eigenvector subspace"]);

// Chemistry
addQuestions("Chemistry", "Organic Chemistry", [
    { t: "Draw the mechanism for the formation of {X}.", diff: "Hard", marks: 10 },
    { t: "Identify the functional group present in {X}.", diff: "Easy", marks: 2 },
    { t: "Explain the synthesis process of {X} in the laboratory.", diff: "Medium", marks: 5 },
    { t: "Compare the reactivity of {X} and {Y} under standard conditions.", diff: "Hard", marks: 10 },
    { t: "What are the common industrial uses for {X}?", diff: "Medium", marks: 5 }
], ["Esters", "Alcohols", "Carboxylic Acids"]);

addQuestions("Chemistry", "Physical Chemistry", [
    { t: "Calculate the standard enthalpy change for {X}.", diff: "Hard", marks: 10 },
    { t: "Define the term {X} in thermodynamics.", diff: "Easy", marks: 2 },
    { t: "How does temperature affect {X}?", diff: "Medium", marks: 5 },
    { t: "Discuss the relationship between {X} and {Y}.", diff: "Hard", marks: 10 },
    { t: "Plot a graph demonstrating {X} over time.", diff: "Medium", marks: 5 }
], ["Gibbs Free Energy", "Activation Energy", "Reaction Kinetics"]);

// English
addQuestions("English", "Literature", [
    { t: "Analyze the thematic significance of {X} in the text.", diff: "Hard", marks: 10 },
    { t: "Identify the main character associated with {X}.", diff: "Easy", marks: 2 },
    { t: "Discuss how the author uses {X} to foreshadow events.", diff: "Medium", marks: 5 },
    { t: "Compare the portrayal of {X} and {Y} across different chapters.", diff: "Hard", marks: 10 },
    { t: "Write a short summary explaining {X}.", diff: "Medium", marks: 5 }
], ["the Green Light symbol", "the betrayal motif", "the hero's journey"]);

addQuestions("English", "Grammar", [
    { t: "Identify the grammatical error in the sentence containing {X}.", diff: "Medium", marks: 5 },
    { t: "Define what {X} means in standard English syntax.", diff: "Easy", marks: 2 },
    { t: "Construct a complex sentence utilizing {X}.", diff: "Medium", marks: 5 },
    { t: "Explain the difference in usage between {X} and {Y}.", diff: "Hard", marks: 10 },
    { t: "Rewrite the paragraph to correctly incorporate {X}.", diff: "Hard", marks: 10 }
], ["a dangling modifier", "a split infinitive", "passive voice structure"]);


// Exact duplicate and similar questions for KMP/LCS testing
questionBank.push({
    id: "dup_exact",
    question: "Analyze the time complexity of Merge Sort.",
    subject: "Computer Science",
    chapter: "Algorithms",
    difficulty: "Hard",
    marks: 10,
    type: "Long"
}); // Exact duplicate of generated question

questionBank.push({
    id: "dup_similar",
    question: "Analyze the time complexity of the Merge Sort.",
    subject: "Computer Science",
    chapter: "Algorithms",
    difficulty: "Hard",
    marks: 10,
    type: "Long"
}); // Highly similar
