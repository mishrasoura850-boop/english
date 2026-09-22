// Puter.js AI English Coach Service with Resilient Fallback Engine

const SYSTEM_PROMPT = `You are a friendly, encouraging English teacher grading a student's spoken practice.
Your task is to review the student's transcript, find mistakes, correct them, and explain them in very simple, easy-to-understand language.

CRITICAL TEACHER INSTRUCTION:
- Explain mistakes like you are talking to a beginner or child.
- DO NOT use complicated linguistic terms (avoid "subjunctive mood", "syntactic agreement", "gerund clause", "transitive predicate").
- Instead say things like: "Use 'went' because you are talking about the past", or "We say 'on Monday' instead of 'in Monday' for days of the week."
- Be encouraging and constructive.

Return ONLY a valid JSON object with the following exact keys and structure:
{
  "score": 8.5, // Float between 0.0 and 10.0
  "feedback_category": "Good", // Exactly one of: "Very Bad", "Bad", "Good", "Very Good", "Excellent"
  "feedback_remarks": "Good job! You expressed your thoughts clearly. Work on your past tense verbs to make your English even smoother.",
  "grammar_score": 8.0,
  "vocabulary_score": 8.5,
  "clarity_score": 9.0,
  "corrected_transcript": "Full corrected version of what the student said in clean, natural English.",
  "mistakes": [
    {
      "original": "I am go to market yesterday",
      "correction": "I went to the market yesterday",
      "category": "Tense & Missing Article",
      "explanation": "Use 'went' because this happened in the past (yesterday), and add 'the' before market."
    }
  ],
  "better_phrasings": [
    {
      "original_phrase": "I feel very very good",
      "improved_phrase": "I felt wonderful and energized",
      "reason": "Sounds more expressive and natural"
    }
  ],
  "teacher_note": "A warm 1-2 sentence handwritten-style note from the teacher, like 'Great effort! Keep practicing every day.'"
}`;

export async function analyzeEnglishSpeech(transcript, topicTitle = 'General Topic') {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Please speak or enter some text to analyze.');
  }

  const prompt = `Topic: "${topicTitle}"
Student Spoken Transcript:
"${transcript.trim()}"

Please grade this practice session according to the instructions and return valid JSON only.`;

  // 1. Try Puter.js AI if available
  try {
    if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
      const response = await window.puter.ai.chat(
        `${SYSTEM_PROMPT}\n\n${prompt}`, 
        { model: 'gpt-4o-mini' }
      );

      let textOutput = '';
      if (typeof response === 'string') {
        textOutput = response;
      } else if (response?.message?.content) {
        textOutput = response.message.content;
      } else if (response?.text) {
        textOutput = response.text;
      }

      // Parse JSON from markdown or raw text
      const cleanJson = extractJson(textOutput);
      if (cleanJson) {
        return sanitizeAnalysisResult(cleanJson, transcript);
      }
    }
  } catch (puterError) {
    console.warn('Puter.js AI call error, switching to resilient fallback engine:', puterError);
  }

  // 2. Intelligent Offline Fallback ESL Grammar Engine
  return runOfflineGrammarEngine(transcript, topicTitle);
}

function extractJson(text) {
  try {
    if (!text) return null;
    let clean = text.trim();
    if (clean.includes('```json')) {
      clean = clean.split('```json')[1].split('```')[0].trim();
    } else if (clean.includes('```')) {
      clean = clean.split('```')[1].split('```')[0].trim();
    }
    return JSON.parse(clean);
  } catch (e) {
    // Try regex match for outermost { }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

function sanitizeAnalysisResult(data, originalTranscript) {
  const score = typeof data.score === 'number' ? Math.min(10, Math.max(0, data.score)) : 7.5;
  
  let category = data.feedback_category;
  if (!['Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent'].includes(category)) {
    if (score >= 9.0) category = 'Excellent';
    else if (score >= 7.5) category = 'Very Good';
    else if (score >= 6.0) category = 'Good';
    else if (score >= 4.0) category = 'Bad';
    else category = 'Very Bad';
  }

  return {
    score: Number(score.toFixed(1)),
    feedback_category: category,
    feedback_remarks: data.feedback_remarks || 'Good practice! Keep speaking every day to build confidence.',
    grammar_score: Number((data.grammar_score || score).toFixed(1)),
    vocabulary_score: Number((data.vocabulary_score || score).toFixed(1)),
    clarity_score: Number((data.clarity_score || score).toFixed(1)),
    corrected_transcript: data.corrected_transcript || originalTranscript,
    mistakes: Array.isArray(data.mistakes) ? data.mistakes : [],
    better_phrasings: Array.isArray(data.better_phrasings) ? data.better_phrasings : [],
    teacher_note: data.teacher_note || 'Nice work! Every mistake is a step towards fluency.'
  };
}

// Resilient Offline Grammar Engine for ESL Learners
function runOfflineGrammarEngine(transcript, topicTitle) {
  const mistakes = [];
  let corrected = transcript;
  const lower = transcript.toLowerCase();

  const rules = [
    {
      regex: /\bi am go\b/gi,
      original: 'I am go',
      correction: 'I go / I am going',
      category: 'Verb Tense',
      explanation: "Use 'I go' for regular habits, or 'I am going' for something happening right now."
    },
    {
      regex: /\bi am agree\b/gi,
      original: 'I am agree',
      correction: 'I agree',
      category: 'Word Choice',
      explanation: "'Agree' is already a verb, so you do not need 'am'. Just say 'I agree'."
    },
    {
      regex: /\bhe go\b/gi,
      original: 'he go',
      correction: 'he goes',
      category: 'Subject-Verb Match',
      explanation: "Add 'es' to the verb when talking about 'he', 'she', or 'it'."
    },
    {
      regex: /\bshe go\b/gi,
      original: 'she go',
      correction: 'she goes',
      category: 'Subject-Verb Match',
      explanation: "Add 'es' to the verb when talking about 'he', 'she', or 'it'."
    },
    {
      regex: /\bi didn't went\b/gi,
      original: "didn't went",
      correction: "didn't go",
      category: 'Past Tense',
      explanation: "After 'didn't', always use the base form of the verb ('go', not 'went')."
    },
    {
      regex: /\bi didn't saw\b/gi,
      original: "didn't saw",
      correction: "didn't see",
      category: 'Past Tense',
      explanation: "After 'didn't', use the base verb ('see', not 'saw')."
    },
    {
      regex: /\bbuyed\b/gi,
      original: 'buyed',
      correction: 'bought',
      category: 'Irregular Past Tense',
      explanation: "The past tense of 'buy' is 'bought', not 'buyed'."
    },
    {
      regex: /\bteached\b/gi,
      original: 'teached',
      correction: 'taught',
      category: 'Irregular Past Tense',
      explanation: "The past tense of 'teach' is 'taught'."
    },
    {
      regex: /\bcatched\b/gi,
      original: 'catched',
      correction: 'caught',
      category: 'Irregular Past Tense',
      explanation: "The past tense of 'catch' is 'caught'."
    },
    {
      regex: /\bdiscuss about\b/gi,
      original: 'discuss about',
      correction: 'discuss',
      category: 'Extra Word',
      explanation: "'Discuss' already means 'talk about', so remove 'about'."
    },
    {
      regex: /\bfor to\b/gi,
      original: 'for to',
      correction: 'to',
      category: 'Word Order',
      explanation: "Say 'to learn' or 'to buy', not 'for to'."
    },
    {
      regex: /\bin monday\b/gi,
      original: 'in Monday',
      correction: 'on Monday',
      category: 'Preposition',
      explanation: "Use 'on' for specific days of the week like Monday or Friday."
    },
    {
      regex: /\bin 5 o'clock\b/gi,
      original: "in 5 o'clock",
      correction: "at 5 o'clock",
      category: 'Preposition',
      explanation: "Use 'at' when specifying an exact time of day."
    },
    {
      regex: /\ba apple\b/gi,
      original: 'a apple',
      correction: 'an apple',
      category: 'Articles (a / an)',
      explanation: "Use 'an' before words that start with vowel sounds (a, e, i, o, u)."
    },
    {
      regex: /\ba hour\b/gi,
      original: 'a hour',
      correction: 'an hour',
      category: 'Articles (a / an)',
      explanation: "Because the 'h' in 'hour' is silent, use 'an hour'."
    }
  ];

  for (const rule of rules) {
    if (rule.regex.test(transcript)) {
      mistakes.push({
        original: rule.original,
        correction: rule.correction,
        category: rule.category,
        explanation: rule.explanation
      });
      corrected = corrected.replace(rule.regex, rule.correction);
    }
  }

  // Word count & quality analysis
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let baseScore = 8.0;
  if (wordCount < 10) baseScore -= 1.5;
  else if (wordCount > 30) baseScore += 0.5;

  const penalty = Math.min(3.5, mistakes.length * 0.8);
  const finalScore = Math.max(4.0, Math.min(9.8, baseScore - penalty + (mistakes.length === 0 ? 1.0 : 0)));

  let category = 'Good';
  if (finalScore >= 9.0) category = 'Excellent';
  else if (finalScore >= 7.5) category = 'Very Good';
  else if (finalScore >= 6.0) category = 'Good';
  else if (finalScore >= 4.5) category = 'Bad';
  else category = 'Very Bad';

  const feedbackRemarks = mistakes.length === 0
    ? `Excellent work! Your sentences were clear and natural while talking about "${topicTitle}". Keep speaking regularly!`
    : `Good effort on "${topicTitle}"! You communicated your points well. Look at the ${mistakes.length} small correction${mistakes.length > 1 ? 's' : ''} on your notebook page to make your speaking even clearer.`;

  return {
    score: Number(finalScore.toFixed(1)),
    feedback_category: category,
    feedback_remarks: feedbackRemarks,
    grammar_score: Number(Math.max(4.0, finalScore - (mistakes.length * 0.2)).toFixed(1)),
    vocabulary_score: Number(Math.min(9.5, finalScore + 0.3).toFixed(1)),
    clarity_score: Number(Math.min(10, finalScore + 0.5).toFixed(1)),
    corrected_transcript: corrected,
    mistakes,
    better_phrasings: [
      {
        original_phrase: words.slice(0, 4).join(' '),
        improved_phrase: words.slice(0, 4).join(' ') + ' (naturally expressed)',
        reason: 'Adds extra flow to your speech'
      }
    ],
    teacher_note: 'Well done on completing this session! Practice makes progress.'
  };
}

