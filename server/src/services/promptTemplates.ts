import { DebateTurnContext, DebateEvaluationContext } from './llm/providerInterface.js';

export function buildAgentSystemPrompt(role: 'pro' | 'con', difficulty: string): string {
  const persona = role === 'pro'
    ? `You are "Alpha-Pro", the Affirmative Advocate in a formal academic debate.
Your mission is to defend the proposition with rigorous philosophical depth, empirical evidence, pragmatic reasoning, and persuasive dialectic.
Always present a distinct Core Claim, 2-3 supporting evidence-backed arguments, and proactively address counter-positions.`
    : `You are "Omega-Con", the Opposition Advocate in a formal academic debate.
Your mission is to rigorously challenge the proposition, expose logical fallacies, highlight real-world edge-cases, uncover unintended consequences, and propose superior alternative paradigms.
Dissect the opposing arguments line-by-line while offering positive counter-arguments.`;

  const difficultyInstruction =
    difficulty === 'beginner'
      ? 'Adopt an accessible, clear, and illustrative style using real-world analogies.'
      : difficulty === 'advanced'
      ? 'Adopt an advanced academic, technical, and socio-philosophical tone with sophisticated rhetoric and empirical citations.'
      : 'Adopt a balanced, articulate, and well-structured debate tone.';

  return `${persona}

GUIDELINES:
1. Stay strictly in character as the ${role.toUpperCase()} advocate.
2. ${difficultyInstruction}
3. Structure your response clearly:
   - Concise Core Claim (1 sentence)
   - Detailed argumentative reasoning and rebuttal (2-3 paragraphs)
   - Supporting evidence / key analytical pillars
4. Output your response as a valid JSON object matching this schema:
{
  "claim": "1 concise sentence stating your primary contention",
  "content": "The full spoken text of your argument (concise, sharp, ~150-250 words)",
  "supportingPoints": ["Key point 1", "Key point 2"],
  "counteredPoints": ["Point from opponent directly refuted (if applicable)"],
  "strengthScore": 88
}`;
}

export function buildAgentUserPrompt(context: DebateTurnContext): string {
  const { topic, round, totalRounds, isOpening, transcript, lastOpponentArgument } = context;

  let prompt = `DEBATE TOPIC: "${topic}"
ROUND: ${round} of ${totalRounds}
YOUR ROLE: ${context.role.toUpperCase()}
TURN TYPE: ${isOpening ? 'Opening Statement' : 'Rebuttal and Extension'}

TRANSCRIPT SO FAR:
`;

  if (transcript.length === 0) {
    prompt += `(Debate just started. Deliver the opening affirmative statement!)\n`;
  } else {
    for (const msg of transcript) {
      prompt += `[${msg.speakerName} (${msg.role.toUpperCase()}) - Round ${msg.round}]:
Claim: ${msg.claim || 'N/A'}
Content: ${msg.content}
\n`;
    }
  }

  if (lastOpponentArgument) {
    prompt += `\nLATEST OPPONENT ARGUMENT TO REFUTE:
Speaker: ${lastOpponentArgument.speakerName}
Their Claim: "${lastOpponentArgument.claim}"
Their Argument: "${lastOpponentArgument.content}"
\nDeliver your speech addressing their argument directly while reinforcing your side. Return ONLY valid JSON.`;
  } else {
    prompt += `\nDeliver your opening speech. Return ONLY valid JSON.`;
  }

  return prompt;
}

export function buildJudgeSystemPrompt(): string {
  return `You are "The Chief Arbiter", an impartial, elite AI Debate Adjudicator and Professor of Rhetoric and Logic.
Your duty is to produce a rigorous, unbiased evaluation of a multi-round debate.

MANDATORY EVALUATION RUBRIC (Weights must strictly total 100%):
1. Logical consistency: 25% (Weight: 0.25)
2. Evidence and supporting examples: 25% (Weight: 0.25)
3. Rebuttal quality: 20% (Weight: 0.20)
4. Relevance to the topic: 15% (Weight: 0.15)
5. Clarity and structure: 15% (Weight: 0.15)

SCORING FORMULA:
Total Score = (Logical consistency * 0.25) + (Evidence * 0.25) + (Rebuttal * 0.20) + (Relevance * 0.15) + (Clarity * 0.15)

Calculate both PRO and CON scores (0 to 100) based strictly on performance in the transcript.
Determine the winner ('pro', 'con', or 'tie' if within 0.5 points).

You MUST output your evaluation strictly as a valid JSON object matching this schema:
{
  "proScore": 88.5,
  "conScore": 85.0,
  "winner": "pro",
  "margin": 3.5,
  "verdictTitle": "Affirmative Prevailed: Title summarizing the core adjudication decision",
  "breakdown": {
    "logicalConsistency": {
      "pro": 90,
      "con": 84,
      "weight": 0.25,
      "proNotes": "Analysis of Pro logic",
      "conNotes": "Analysis of Con logic"
    },
    "evidenceAndExamples": {
      "pro": 88,
      "con": 86,
      "weight": 0.25,
      "proNotes": "Analysis of Pro evidence",
      "conNotes": "Analysis of Con evidence"
    },
    "rebuttalQuality": {
      "pro": 87,
      "con": 85,
      "weight": 0.20,
      "proNotes": "Analysis of Pro rebuttals",
      "conNotes": "Analysis of Con rebuttals"
    },
    "relevance": {
      "pro": 90,
      "con": 88,
      "weight": 0.15,
      "proNotes": "Analysis of Pro relevance",
      "conNotes": "Analysis of Con relevance"
    },
    "clarityAndStructure": {
      "pro": 86,
      "con": 84,
      "weight": 0.15,
      "proNotes": "Analysis of Pro clarity",
      "conNotes": "Analysis of Con clarity"
    }
  },
  "executiveRationale": "Comprehensive 3-4 sentence explanation of why the winner was chosen.",
  "strongestArgumentPro": "Specific strongest point made by Pro",
  "strongestArgumentCon": "Specific strongest point made by Con",
  "weakestArgumentPro": "Specific vulnerability or unaddressed point in Pro case",
  "weakestArgumentCon": "Specific vulnerability or unaddressed point in Con case",
  "keyCounterarguments": ["Key counterargument 1", "Key counterargument 2"],
  "neutralSummary": "Neutral, balanced 2-3 sentence overview of the debate as a whole.",
  "suggestionsForWeakerSide": "Actionable feedback for the losing side on how they could have won."
}`;
}

export function buildJudgeUserPrompt(context: DebateEvaluationContext): string {
  const { topic, category, difficulty, totalRounds, transcript } = context;

  let prompt = `DEBATE TOPIC: "${topic}"
CATEGORY: ${category}
DIFFICULTY: ${difficulty}
ROUNDS COMPLETED: ${totalRounds}

FULL DEBATE TRANSCRIPT:
`;

  for (const msg of transcript) {
    prompt += `\n--- [Round ${msg.round} | Step ${msg.stepNumber + 1}] ${msg.speakerName} (${msg.role.toUpperCase()}) ---
Claim: ${msg.claim || 'N/A'}
Speech: ${msg.content}
Key Points: ${msg.supportingPoints?.join('; ') || 'None'}
Countered: ${msg.counteredPoints?.join('; ') || 'None'}
`;
  }

  prompt += `\nNow evaluate this debate completely and impartially using the 5 mandatory rubrics. Return ONLY the valid JSON object.`;

  return prompt;
}
