"use strict";

// ---------- I18N ----------
const translations = {
	en: {
		app_title: "Rural Learning Quest",
		install_app: "Install",
		get_started: "Get Started",
		select_language: "Language",
		select_grade: "Grade",
		select_subject: "Subject",
		subject_math: "Math",
		subject_science: "Science",
		subject_english: "English",
		start_quiz: "Start Quiz",
		submit: "Submit",
		next_question: "Next",
		results: "Results",
		restart: "Restart",
		xp: "XP",
		level: "Level",
		streak: "Streak",
		lives: "Lives",
		footer: "Made for rural education with love.",
		correct: "Correct! +{xp} XP",
		wrong: "Oops! Correct answer: {answer}",
		quiz_meta: "{subject} • Grade {grade} • {difficulty}",
		difficulty_easy: "Easy",
		difficulty_medium: "Medium",
		difficulty_hard: "Hard",
		result_summary: "You scored {score}/{total} (XP {xp}). Level {level}",
		badges_earned: "Badges Earned",
		lives_hearts: (n) => "❤️".repeat(n) + "🖤".repeat(Math.max(0, 3 - n)),
		math_plus: "plus",
		math_minus: "minus",
		math_times: "times",
		math_divide: "divided by",
	},
	hi: {
		app_title: "ग्रामीण लर्निंग क्वेस्ट",
		install_app: "इंस्टॉल",
		get_started: "शुरू करें",
		select_language: "भाषा",
		select_grade: "कक्षा",
		select_subject: "विषय",
		subject_math: "गणित",
		subject_science: "विज्ञान",
		subject_english: "अंग्रेज़ी",
		start_quiz: "क्विज़ शुरू करें",
		submit: "जमा करें",
		next_question: "अगला",
		results: "परिणाम",
		restart: "फिर से शुरू करें",
		xp: "अंक",
		level: "स्तर",
		streak: "लगातार",
		lives: "जीवन",
		footer: "ग्रामीण शिक्षा के लिए प्यार से बनाया गया।",
		correct: "सही! +{xp} XP",
		wrong: "गलत! सही उत्तर: {answer}",
		quiz_meta: "{subject} • कक्षा {grade} • {difficulty}",
		difficulty_easy: "आसान",
		difficulty_medium: "मध्यम",
		difficulty_hard: "कठिन",
		result_summary: "आपका स्कोर {score}/{total} (XP {xp}). स्तर {level}",
		badges_earned: "प्राप्त बैज",
		lives_hearts: (n) => "❤️".repeat(n) + "🖤".repeat(Math.max(0, 3 - n)),
		math_plus: "जोड़",
		math_minus: "घटाना",
		math_times: "गुणा",
		math_divide: "भाग",
	},
};

function getLang() {
	return localStorage.getItem("lang") || "en";
}

function setLang(lang) {
	localStorage.setItem("lang", lang);
}

function t(key, vars) {
	const lang = getLang();
	const value = translations[lang][key];
	if (typeof value === "function") {
		return value(vars);
	}
	if (typeof value === "string") {
		return (value || "").replace(/\{(.*?)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ""));
	}
	return key;
}

function applyI18n() {
	document.querySelectorAll("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		if (!key) return;
		el.textContent = t(key);
	});
	document.getElementById("appTitle").textContent = t("app_title");
	document.getElementById("livesValue").textContent = translations[getLang()].lives_hearts(3);
}

// ---------- Utilities ----------
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// ---------- Question Generation ----------
const SUBJECTS = {
	math: { id: "math", i18nKey: "subject_math" },
	science: { id: "science", i18nKey: "subject_science" },
	english: { id: "english", i18nKey: "subject_english" },
};

const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

function getDifficultyLabel(diff) {
	if (diff === "easy") return t("difficulty_easy");
	if (diff === "medium") return t("difficulty_medium");
	return t("difficulty_hard");
}

function generateMathQuestion(grade, difficulty) {
	// Difficulty scales numbers and operators
	const opIndex = difficulty === "easy" ? randInt(0, 1) : difficulty === "medium" ? randInt(0, 2) : randInt(0, 3);
	const ops = [
		{ sym: "+", name: t("math_plus"), fn: (a, b) => a + b },
		{ sym: "-", name: t("math_minus"), fn: (a, b) => a - b },
		{ sym: "×", name: t("math_times"), fn: (a, b) => a * b },
		{ sym: "÷", name: t("math_divide"), fn: (a, b) => Math.floor(a / b) },
	];
	const op = ops[opIndex];

	const maxBase = Math.min(grade * 10, 120);
	const a = difficulty === "hard" ? randInt(maxBase / 2, maxBase) : randInt(1, maxBase);
	let b = difficulty === "hard" ? randInt(maxBase / 3, maxBase / 1.5) : randInt(1, Math.max(2, maxBase / 1.5));
	if (op.sym === "÷") {
		b = Math.max(1, b);
		// Ensure divisibility to avoid fractions for simplicity
		const prod = a * b;
		const q = randInt(2, 12);
		b = q;
		const result = a;
		const dividend = result * b;
		const answer = result;
		const wrongs = shuffle([answer + randInt(1, 5), Math.max(0, answer - randInt(1, 5)), answer + randInt(6, 10)]).slice(0, 3);
		const options = shuffle([answer, ...wrongs]).map(String);
		const prompt = `${dividend} ${op.sym} ${b} = ?`;
		return { text: prompt, options, answerIndex: options.indexOf(String(answer)), metaAnswer: String(answer) };
	}
	const answer = op.fn(a, b);
	const wrongs = shuffle([answer + randInt(1, 5), Math.max(0, answer - randInt(1, 5)), answer + randInt(6, 10)]).slice(0, 3);
	const options = shuffle([answer, ...wrongs]).map(String);
	const prompt = `${a} ${op.sym} ${b} = ?`;
	return { text: prompt, options, answerIndex: options.indexOf(String(answer)), metaAnswer: String(answer) };
}

// Science and English pools with bilingual content and difficulty tiers by grade group
const questionPools = {
	science: {
		"6-8": {
			easy: [
				{ en: "Plants make food by which process?", hi: "पौधे भोजन किस प्रक्रिया से बनाते हैं?", options: { en: ["Photosynthesis", "Respiration", "Digestion", "Transpiration"], hi: ["प्रकाश संश्लेषण", "श्वसन", "पाचन", "वाष्पोत्सर्जन"] }, answerIndex: 0 },
				{ en: "Which organ pumps blood?", hi: "रक्त को कौन सा अंग पंप करता है?", options: { en: ["Heart", "Lungs", "Liver", "Stomach"], hi: ["हृदय", "फेफड़े", "यकृत", "पेट"] }, answerIndex: 0 },
			],
			medium: [
				{ en: "Water changes to vapor by?", hi: "जल भाप में किससे बदलता है?", options: { en: ["Evaporation", "Condensation", "Freezing", "Melting"], hi: ["वाष्पीकरण", "संघनन", "जमना", "गलना"] }, answerIndex: 0 },
				{ en: "Earth revolves around?", hi: "पृथ्वी किसके चारों ओर घूमती है?", options: { en: ["Sun", "Moon", "Mars", "Venus"], hi: ["सूर्य", "चंद्रमा", "मंगल", "शुक्र"] }, answerIndex: 0 },
			],
			hard: [
				{ en: "Metal + acid generally gives?", hi: "धातु + अम्ल से सामान्यतः क्या बनता है?", options: { en: ["Salt + Hydrogen", "Salt + Oxygen", "Hydrogen + Water", "Water + Carbon"], hi: ["लवण + हाइड्रोजन", "लवण + ऑक्सीजन", "हाइड्रोजन + जल", "जल + कार्बन"] }, answerIndex: 0 },
				{ en: "SI unit of force?", hi: "बल की SI इकाई?", options: { en: ["Newton", "Joule", "Pascal", "Watt"], hi: ["न्यूटन", "जूल", "पास्कल", "वाट"] }, answerIndex: 0 },
			],
		},
		"9-10": {
			easy: [
				{ en: "Blood carries oxygen using?", hi: "रक्त ऑक्सीजन किससे ले जाता है?", options: { en: ["Hemoglobin", "Platelets", "Plasma", "WBC"], hi: ["हीमोग्लोबिन", "प्लेटलेट", "प्लाज़्मा", "श्वेत रक्त कण"] }, answerIndex: 0 },
				{ en: "Green pigment in plants?", hi: "पौधों में हरा वर्णक?", options: { en: ["Chlorophyll", "Melanin", "Carotene", "Hemoglobin"], hi: ["क्लोरोफिल", "मेलानिन", "कैरोतीन", "हीमोग्लोबिन"] }, answerIndex: 0 },
			],
			medium: [
				{ en: "Ohm's law relates V, I and?", hi: "ओम का नियम V, I और किससे संबंधित है?", options: { en: ["R", "P", "E", "F"], hi: ["R", "P", "E", "F"] }, answerIndex: 0 },
				{ en: "DNA is found in?", hi: "DNA कहाँ पाया जाता है?", options: { en: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], hi: ["नाभिक", "माइटोकॉन्ड्रिया", "राइबोसोम", "गोल्जी"] }, answerIndex: 0 },
			],
			hard: [
				{ en: "pH < 7 indicates?", hi: "pH < 7 क्या दर्शाता है?", options: { en: ["Acidic", "Basic", "Neutral", "Salt"], hi: ["अम्लीय", "क्षारीय", "तटस्थ", "लवण"] }, answerIndex: 0 },
				{ en: "Unit of electric power?", hi: "विद्युत शक्ति की इकाई?", options: { en: ["Watt", "Volt", "Ampere", "Ohm"], hi: ["वाट", "वोल्ट", "एम्पीयर", "ओम"] }, answerIndex: 0 },
			],
		},
		"11-12": {
			easy: [
				{ en: "Glucose formula?", hi: "ग्लूकोज़ का सूत्र?", options: { en: ["C6H12O6", "C2H5OH", "H2O", "CO2"], hi: ["C6H12O6", "C2H5OH", "H2O", "CO2"] }, answerIndex: 0 },
				{ en: "Neuron transmits?", hi: "न्यूरॉन क्या संचारित करता है?", options: { en: ["Impulse", "Blood", "Hormone", "Enzyme"], hi: ["आवेग", "रक्त", "हार्मोन", "एंजाइम"] }, answerIndex: 0 },
			],
			medium: [
				{ en: "Avogadro number approx?", hi: "एवोगैड्रो संख्या लगभग?", options: { en: ["6.02×10^23", "3.0×10^8", "9.8 m/s^2", "1.6×10^-19"], hi: ["6.02×10^23", "3.0×10^8", "9.8 m/s^2", "1.6×10^-19"] }, answerIndex: 0 },
				{ en: "Enzyme are mostly?", hi: "एंजाइम अधिकतर क्या होते हैं?", options: { en: ["Proteins", "Lipids", "Carbs", "Vitamins"], hi: ["प्रोटीन", "वसा", "कार्बोहाइड्रेट", "विटामिन"] }, answerIndex: 0 },
			],
			hard: [
				{ en: "Faraday constant equals?", hi: "फैराडे नियतांक किसके बराबर है?", options: { en: ["NAe", "RT", "kT", "e/m"], hi: ["NAe", "RT", "kT", "e/m"] }, answerIndex: 0 },
				{ en: "SI unit of entropy?", hi: "एंट्रॉपी की SI इकाई?", options: { en: ["J/K", "J", "N/m", "Pa"], hi: ["J/K", "J", "N/m", "Pa"] }, answerIndex: 0 },
			],
		},
	},
	english: {
		"6-8": {
			easy: [
				{ en: "Choose the synonym of 'happy'", hi: "'happy' का समानार्थी चुनें", options: { en: ["Joyful", "Angry", "Sad", "Tired"], hi: ["Joyful", "Angry", "Sad", "Tired"] }, answerIndex: 0 },
				{ en: "Pick the noun: He runs fast.", hi: "संज्ञा चुनें: He runs fast.", options: { en: ["He", "runs", "fast", "None"], hi: ["He", "runs", "fast", "None"] }, answerIndex: 0 },
			],
			medium: [
				{ en: "Plural of 'child' is?", hi: "'child' का बहुवचन?", options: { en: ["children", "childs", "childes", "child"], hi: ["children", "childs", "childes", "child"] }, answerIndex: 0 },
				{ en: "Fill in: She ___ a book.", hi: "पूरक करें: She ___ a book.", options: { en: ["has", "have", "having", "had"], hi: ["has", "have", "having", "had"] }, answerIndex: 0 },
			],
			hard: [
				{ en: "Antonym of 'ancient'", hi: "'ancient' का विलोम", options: { en: ["modern", "old", "elder", "previous"], hi: ["modern", "old", "elder", "previous"] }, answerIndex: 0 },
				{ en: "Identify adjective: The sky is blue.", hi: "विशेषण पहचानें: The sky is blue.", options: { en: ["blue", "sky", "is", "The"], hi: ["blue", "sky", "is", "The"] }, answerIndex: 0 },
			],
		},
		"9-10": {
			easy: [
				{ en: "Choose correct: They ___ playing.", hi: "सही चुनें: They ___ playing.", options: { en: ["are", "is", "am", "were"], hi: ["are", "is", "am", "were"] }, answerIndex: 0 },
				{ en: "Synonym of 'begin'", hi: "'begin' का समानार्थी", options: { en: ["start", "stop", "end", "close"], hi: ["start", "stop", "end", "close"] }, answerIndex: 0 },
			],
			medium: [
				{ en: "Passive of: She writes a letter.", hi: "निष्क्रिय वाक्य: She writes a letter.", options: { en: ["A letter is written by her", "A letter was written by her", "A letter has written by her", "A letter wrote by her"], hi: ["A letter is written by her", "A letter was written by her", "A letter has written by her", "A letter wrote by her"] }, answerIndex: 0 },
				{ en: "Correct tense: He ___ since 5 am.", hi: "सही काल: He ___ since 5 am.", options: { en: ["has been working", "is working", "worked", "works"], hi: ["has been working", "is working", "worked", "works"] }, answerIndex: 0 },
			],
			hard: [
				{ en: "Meaning of 'ubiquitous'", hi: "'ubiquitous' का अर्थ", options: { en: ["present everywhere", "rare", "dangerous", "useless"], hi: ["present everywhere", "rare", "dangerous", "useless"] }, answerIndex: 0 },
				{ en: "Identify clause type: If it rains, we will stay.", hi: "उपवाक्य प्रकार: If it rains, we will stay.", options: { en: ["conditional", "relative", "noun", "adjective"], hi: ["conditional", "relative", "noun", "adjective"] }, answerIndex: 0 },
			],
		},
		"11-12": {
			easy: [
				{ en: "Choose correct: He would rather ___ home.", hi: "सही चुनें: He would rather ___ home.", options: { en: ["stay", "to stay", "stays", "stayed"], hi: ["stay", "to stay", "stays", "stayed"] }, answerIndex: 0 },
				{ en: "Antonym of 'brevity'", hi: "'brevity' का विलोम", options: { en: ["lengthiness", "shortness", "briefness", "conciseness"], hi: ["lengthiness", "shortness", "briefness", "conciseness"] }, answerIndex: 0 },
			],
			medium: [
				{ en: "Figure of speech: 'Silence roared'", hi: "अलंकार पहचानें: 'Silence roared'", options: { en: ["oxymoron", "metaphor", "personification", "simile"], hi: ["oxymoron", "metaphor", "personification", "simile"] }, answerIndex: 0 },
				{ en: "Correct usage: 'neither...nor' takes", hi: "सही प्रयोग: 'neither...nor' के साथ", options: { en: ["singular verb", "plural verb", "any verb", "no verb"], hi: ["singular verb", "plural verb", "any verb", "no verb"] }, answerIndex: 0 },
			],
			hard: [
				{ en: "Meaning of 'antediluvian'", hi: "'antediluvian' का अर्थ", options: { en: ["very old", "modern", "watery", "ancient river"], hi: ["very old", "modern", "watery", "ancient river"] }, answerIndex: 0 },
				{ en: "Choose correct: He insisted ___ my going.", hi: "सही चुनें: He insisted ___ my going.", options: { en: ["on", "to", "for", "at"], hi: ["on", "to", "for", "at"] }, answerIndex: 0 },
			],
		},
	},
};

function gradeGroup(grade) {
	if (grade <= 8) return "6-8";
	if (grade <= 10) return "9-10";
	return "11-12";
}

function getScienceEnglishQuestion(subject, grade, difficulty) {
	const pool = questionPools[subject][gradeGroup(grade)][difficulty];
	const q = pool[randInt(0, pool.length - 1)];
	const lang = getLang();
	return {
		text: q[lang],
		options: q.options[lang],
		answerIndex: q.answerIndex,
		metaAnswer: q.options[lang][q.answerIndex],
	};
}

function buildQuestion(subjectId, grade, difficulty) {
	if (subjectId === "math") {
		return generateMathQuestion(grade, difficulty);
	}
	if (subjectId === "science" || subjectId === "english") {
		return getScienceEnglishQuestion(subjectId, grade, difficulty);
	}
	throw new Error("Unknown subject");
}

// ---------- Gamification ----------
const XP_BY_DIFF = { easy: 5, medium: 10, hard: 15 };
const QUESTIONS_PER_QUIZ = 10;

class ProgressStore {
	static load() {
		try {
			return JSON.parse(localStorage.getItem("progress") || "null") || { xp: 0, level: 1, bestStreak: 0, badges: [] };
		} catch {
			return { xp: 0, level: 1, bestStreak: 0, badges: [] };
		}
	}
	static save(data) {
		localStorage.setItem("progress", JSON.stringify(data));
	}
}

class QuizEngine {
	constructor() {
		this.state = {
			language: getLang(),
			grade: 6,
			subject: SUBJECTS.math.id,
			currentIndex: 0,
			score: 0,
			streak: 0,
			lives: 3,
			questions: [],
			selectedOption: null,
			currentDifficulty: "easy",
			awardedBadges: [],
		};
		this.progress = ProgressStore.load();
	}

	startQuiz() {
		this.state.currentIndex = 0;
		this.state.score = 0;
		this.state.streak = 0;
		this.state.lives = 3;
		this.state.selectedOption = null;
		this.state.currentDifficulty = "easy";
		this.state.awardedBadges = [];
		this.state.questions = this.generateQuizQuestions();
		this.renderQuestion();
	}

	generateQuizQuestions() {
		const qs = [];
		for (let i = 0; i < QUESTIONS_PER_QUIZ; i += 1) {
			let diff = "easy";
			if (i >= 3 && i < 7) diff = "medium";
			if (i >= 7) diff = "hard";
			qs.push(buildQuestion(this.state.subject, this.state.grade, diff));
		}
		return qs;
	}

	renderQuestion() {
		const q = this.state.questions[this.state.currentIndex];
		const total = this.state.questions.length;
		document.getElementById("quizPanel").classList.remove("hidden");
		document.getElementById("resultPanel").classList.add("hidden");
		const subjectLabel = t(SUBJECTS[this.state.subject].i18nKey);
		document.getElementById("quizMeta").textContent = t("quiz_meta", { subject: subjectLabel, grade: this.state.grade, difficulty: getDifficultyLabel(this.currentDifficulty()) });
		document.getElementById("questionText").textContent = `${this.state.currentIndex + 1}. ${q.text}`;
		const optionsContainer = document.getElementById("optionsContainer");
		optionsContainer.innerHTML = "";
		q.options.forEach((opt, idx) => {
			const btn = document.createElement("button");
			btn.className = "option";
			btn.textContent = opt;
			btn.addEventListener("click", () => {
				this.state.selectedOption = idx;
				Array.from(optionsContainer.children).forEach((c) => c.classList.remove("selected"));
				btn.classList.add("selected");
			});
			optionsContainer.appendChild(btn);
		});
		document.getElementById("feedback").textContent = "";
		document.getElementById("submitBtn").disabled = false;
		document.getElementById("nextBtn").disabled = true;
		const percent = Math.round((this.state.currentIndex / total) * 100);
		document.getElementById("progressBar").style.width = `${percent}%`;
	}

	currentDifficulty() {
		if (this.state.currentIndex < 3) return "easy";
		if (this.state.currentIndex < 7) return "medium";
		return "hard";
	}

	submitAnswer() {
		const q = this.state.questions[this.state.currentIndex];
		if (this.state.selectedOption == null) return;
		const isCorrect = this.state.selectedOption === q.answerIndex;
		const optionsContainer = document.getElementById("optionsContainer");
		Array.from(optionsContainer.children).forEach((c, idx) => {
			c.classList.toggle("correct", idx === q.answerIndex);
			c.classList.toggle("incorrect", idx === this.state.selectedOption && !isCorrect);
		});
		const diff = this.currentDifficulty();
		if (isCorrect) {
			this.state.score += 1;
			this.state.streak += 1;
			const xp = XP_BY_DIFF[diff];
			this.progress.xp += xp;
			this.progress.bestStreak = Math.max(this.progress.bestStreak, this.state.streak);
			this.checkLevelUp();
			document.getElementById("feedback").textContent = t("correct", { xp });
			document.getElementById("feedback").className = "feedback ok";
		} else {
			this.state.streak = 0;
			this.state.lives -= 1;
			document.getElementById("feedback").textContent = t("wrong", { answer: q.metaAnswer });
			document.getElementById("feedback").className = "feedback err";
		}
		this.updateStatsUI();
		document.getElementById("submitBtn").disabled = true;
		document.getElementById("nextBtn").disabled = false;
		this.maybeAwardBadges();
		ProgressStore.save(this.progress);
	}

	nextQuestion() {
		if (this.state.lives <= 0 || this.state.currentIndex >= this.state.questions.length - 1) {
			this.finishQuiz();
			return;
		}
		this.state.currentIndex += 1;
		this.state.selectedOption = null;
		this.renderQuestion();
	}

	finishQuiz() {
		const total = this.state.questions.length;
		const percent = Math.round(((this.state.score) / total) * 100);
		document.getElementById("progressBar").style.width = "100%";
		document.getElementById("quizPanel").classList.add("hidden");
		document.getElementById("resultPanel").classList.remove("hidden");
		document.getElementById("resultSummary").textContent = t("result_summary", { score: this.state.score, total, xp: this.progress.xp, level: this.progress.level });
		this.renderBadges();
	}

	checkLevelUp() {
		const newLevel = Math.floor(this.progress.xp / 100) + 1;
		if (newLevel > this.progress.level) {
			this.progress.level = newLevel;
		}
	}

	maybeAwardBadges() {
		const badges = [];
		if (!this.progress.badges.includes("first_correct") && this.state.score >= 1) badges.push({ id: "first_correct", label: "First Steps" });
		if (!this.progress.badges.includes("streak_5") && this.progress.bestStreak >= 5) badges.push({ id: "streak_5", label: "Streak 5" });
		if (!this.progress.badges.includes("level_5") && this.progress.level >= 5) badges.push({ id: "level_5", label: "Level 5" });
		badges.forEach((b) => this.progress.badges.push(b.id));
		this.state.awardedBadges.push(...badges.map((b) => b.label));
	}

	renderBadges() {
		const container = document.getElementById("badgesContainer");
		container.innerHTML = "";
		if (this.state.awardedBadges.length === 0 && this.progress.badges.length === 0) {
			return;
		}
		const title = document.createElement("div");
		title.textContent = t("badges_earned");
		container.appendChild(title);
		const set = new Set([ ...this.progress.badges.map((id) => (id === "first_correct" ? "First Steps" : id === "streak_5" ? "Streak 5" : id === "level_5" ? "Level 5" : id)), ...this.state.awardedBadges ]);
		set.forEach((label) => {
			const el = document.createElement("span");
			el.className = "badge";
			const dot = document.createElement("span");
			dot.className = "dot";
			el.appendChild(dot);
			el.appendChild(document.createTextNode(label));
			container.appendChild(el);
		});
	}

	updateStatsUI() {
		document.getElementById("xpValue").textContent = String(this.progress.xp);
		document.getElementById("levelValue").textContent = String(this.progress.level);
		document.getElementById("streakValue").textContent = String(this.state.streak);
		document.getElementById("livesValue").textContent = translations[getLang()].lives_hearts(this.state.lives);
	}
}

// ---------- UI Wiring ----------
const app = new QuizEngine();

function populateGrades() {
	const select = document.getElementById("gradeSelect");
	select.innerHTML = "";
	for (let g = 6; g <= 12; g += 1) {
		const opt = document.createElement("option");
		opt.value = String(g);
		opt.textContent = String(g);
		select.appendChild(opt);
	}
	select.value = String(app.state.grade);
}

function bindEvents() {
	document.getElementById("languageSelect").value = getLang();
	document.getElementById("languageSelect").addEventListener("change", (e) => {
		const lang = e.target.value;
		setLang(lang);
		applyI18n();
		// Rerender current question to update language for science/english
		if (!document.getElementById("quizPanel").classList.contains("hidden")) {
			if (app.state.subject !== "math") {
				// rebuild current question text/options in new language
				const diff = app.currentDifficulty();
				app.state.questions[app.state.currentIndex] = buildQuestion(app.state.subject, app.state.grade, diff);
			}
			app.renderQuestion();
		}
	});

	document.getElementById("gradeSelect").addEventListener("change", (e) => {
		app.state.grade = Number(e.target.value);
	});

	document.getElementById("subjectSelect").addEventListener("change", (e) => {
		app.state.subject = e.target.value;
	});

	document.getElementById("startBtn").addEventListener("click", () => {
		document.getElementById("setupPanel").classList.add("hidden");
		document.getElementById("statsPanel").classList.remove("hidden");
		app.startQuiz();
		app.updateStatsUI();
	});

	document.getElementById("submitBtn").addEventListener("click", () => app.submitAnswer());
	document.getElementById("nextBtn").addEventListener("click", () => app.nextQuestion());
	document.getElementById("restartBtn").addEventListener("click", () => {
		document.getElementById("resultPanel").classList.add("hidden");
		document.getElementById("setupPanel").classList.remove("hidden");
	});
}

function initPWA() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/workspace/rural-gamified/sw.js").catch(() => {});
	}
	let deferredPrompt = null;
	const installBtn = document.getElementById("installBtn");
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredPrompt = e;
		installBtn.style.display = "inline-flex";
	});
	installBtn.addEventListener("click", async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		await deferredPrompt.userChoice;
		deferredPrompt = null;
		installBtn.style.display = "none";
	});
}

function init() {
	document.getElementById("year").textContent = String(new Date().getFullYear());
	populateGrades();
	applyI18n();
	bindEvents();
	app.updateStatsUI();
	initPWA();
}

document.addEventListener("DOMContentLoaded", init);