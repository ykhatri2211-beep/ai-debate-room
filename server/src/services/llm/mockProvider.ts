import {
  ILLMProvider,
  DebateTurnContext,
  GeneratedArgument,
  DebateEvaluationContext,
  LLMHealthStatus
} from './providerInterface.js';
import { JudgeEvaluation } from '../../types/debate.js';

export class MockProvider implements ILLMProvider {
  public name = 'Neural Simulation Engine (Mock/Autonomous)';

  public async checkHealth(): Promise<LLMHealthStatus> {
    return {
      provider: 'Neural Simulation Engine',
      model: 'debate-neural-sim-v2.5',
      isConfigured: true,
      isHealthy: true,
      latencyMs: 42,
      fallbackAvailable: true,
    };
  }

  public async generateArgument(context: DebateTurnContext): Promise<GeneratedArgument> {
    // Simulate brief thinking latency (300-600ms) for realistic feel
    await new Promise((res) => setTimeout(res, 400));

    const { topic, role, round, isOpening, lastOpponentArgument } = context;
    const lowerTopic = topic.toLowerCase();

    // Context-sensitive topic-specific knowledge bases
    if (lowerTopic.includes('replace') || lowerTopic.includes('programmer') || lowerTopic.includes('code')) {
      return this.generateProgrammingArgument(role, round, isOpening, lastOpponentArgument);
    } else if (lowerTopic.includes('remote') || lowerTopic.includes('office') || lowerTopic.includes('work')) {
      return this.generateRemoteWorkArgument(role, round, isOpening, lastOpponentArgument);
    } else if (lowerTopic.includes('social media') || lowerTopic.includes('regulation') || lowerTopic.includes('censor')) {
      return this.generateSocialMediaArgument(role, round, isOpening, lastOpponentArgument);
    } else if (lowerTopic.includes('open-source') || lowerTopic.includes('proprietary')) {
      return this.generateOpenSourceArgument(role, round, isOpening, lastOpponentArgument);
    } else if (lowerTopic.includes('attendance') || lowerTopic.includes('college') || lowerTopic.includes('mandatory')) {
      return this.generateAttendanceArgument(role, round, isOpening, lastOpponentArgument);
    } else if (lowerTopic.includes('production') || lowerTopic.includes('trust')) {
      return this.generateTrustCodeArgument(role, round, isOpening, lastOpponentArgument);
    }

    // Generic heuristic generation for arbitrary custom topics entered by user
    return this.generateGenericArgument(topic, role, round, isOpening, lastOpponentArgument);
  }

  private generateProgrammingArgument(
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      if (isOpening || round === 1) {
        return {
          claim: 'Autonomous AI synthesis eliminates syntactical toil, multiplying human productivity and democratizing innovation.',
          content: 'The history of computing is an unbroken ladder of abstraction—from physical vacuum tube wiring to punch cards, assembly, high-level languages, and now declarative natural language intent. Demanding human engineers continue handcrafting boilerplate syntax ignores empirical studies showing a 55% leap in development speed with neural assistance. Total automation of programming frees intellectual bandwidth to address higher-order systemic architecture and civilizational challenges.',
          supportingPoints: [
            'Historical continuum of increasing computing abstractions',
            'Empirical 50%+ reduction in feature cycle delivery time',
            'Democratization of bespoke software creation for all industries'
          ],
          counteredPoints: lastOpp ? [lastOpp.claim] : [],
          strengthScore: 89,
        };
      } else {
        return {
          claim: 'Neuro-symbolic verification pipelines and autonomous sandboxing resolve security and hallucination concerns.',
          content: `In response to the opposition's concerns regarding code reliability, empirical software engineering demonstrates that human programmers are responsible for over 90% of legacy security CVEs. AI models paired with deterministic linters, formal verification theorems, and automated fuzzing establish a verifiable correctness barrier far higher than fallible human code review. The paradigm shift is irreversible: developers evolve from manual typists into strategic system directors.`,
          supportingPoints: [
            'Neuro-symbolic execution engines verify semantic invariant constraints',
            'Human peer review suffers from cognitive fatigue and omission bias'
          ],
          counteredPoints: [lastOpp?.claim || 'AI code contains critical unverified vulnerabilities'],
          strengthScore: 87,
        };
      }
    } else {
      if (round === 1) {
        return {
          claim: 'True software engineering is socio-technical governance and liability, which cannot be delegated to probabilistic models.',
          content: `The affirmative conflates the mechanical generation of syntax with the profound discipline of software engineering. Writing code is the easy 20%; the remaining 80% requires stakeholder diplomacy, safety trade-offs, defensive architecture, and ethical liability. When mission-critical infrastructure in avionics, power grids, or healthcare fails, statistical weight distributions cannot be held legally or morally accountable. Replacing human programmers creates an existential single point of catastrophic failure.`,
          supportingPoints: [
            'Software engineering is 80% socio-technical problem formulation and liability',
            'Statistical language models lack causal comprehension and moral agency',
            'Provenance, intellectual property, and supply chain corruption risks'
          ],
          counteredPoints: [lastOpp?.claim || 'AI multiplies development throughput'],
          strengthScore: 92,
        };
      } else {
        return {
          claim: 'Replacing human practitioners triggers model collapse and an irrecoverable atrophy of foundational computing literacy.',
          content: `The affirmative's vision leads directly to an epistemic crisis. If future generations never write foundational systems code, humanity permanently loses the capacity to audit, troubleshoot, or rebuild failing digital foundations. Furthermore, feeding synthetic code back into subsequent model training loops precipitates catastrophic model collapse. We must empower programmers through augmentation, never surrender our engineering agency to autonomous black boxes.`,
          supportingPoints: [
            'Cognitive atrophy of foundational computing skills across future generations',
            'Synthetic data feedback loops induce mathematical model collapse'
          ],
          counteredPoints: [lastOpp?.claim || 'Verification pipelines will catch all synthetic defects'],
          strengthScore: 93,
        };
      }
    }
  }

  private generateRemoteWorkArgument(
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      return {
        claim: round === 1
          ? 'Remote work democratizes global opportunity, eliminates dead transit hours, and unlocks deep focused productivity.'
          : 'Asynchronous documentation architectures systematically outperform fragile open-office serendipity.',
        content: round === 1
          ? 'Commuting steals 250+ hours yearly from the average professional while saturating urban corridors with emissions and stress. Remote work restores personal sovereignty, enables hyper-focused deep work free from constant open-plan office disruptions, and allows companies to tap diverse global talent beyond high-cost geographic clusters.'
          : `Omega-Con clings to the nostalgic myth of the watercooler. Modern distributed companies prove that transparent asynchronous RFCs, deliberate pairing sessions, and structured documentation provide vastly superior institutional knowledge sharing without the toxic proximity bias that punishes quiet contributors and caregivers.`,
        supportingPoints: [
          'Direct recovery of 20+ hours per month of commuting time',
          'Access to global employment regardless of birth location',
          'Measured increases in objective deep-work focus sprints'
        ],
        counteredPoints: lastOpp ? [lastOpp.claim] : [],
        strengthScore: round === 1 ? 90 : 88,
      };
    } else {
      return {
        claim: round === 1
          ? 'Physical co-presence is vital for spontaneous innovation, cultural resilience, and organic junior mentorship.'
          : 'Prolonged remote isolation blurs psychological boundaries, triggering silent burnout and organizational alienation.',
        content: round === 1
          ? 'High-bandwidth human collaboration is rooted in physical presence, body language, and unplanned hallway friction. Remote-first setups systematically isolate early-career professionals, depriving them of the tacit apprenticeship and relational trust that make durable organizations thrive.'
          : `Alpha-Pro ignores the acute psychological crisis of the "living room office". Transactional digital interactions erode organizational loyalty, turn coworkers into interchangeable Slack avatars, and cause chronic digital exhaustion. The optimal future is hybrid cohesion, not detached domestic isolation.`,
        supportingPoints: [
          'Tacit knowledge transfer and organic apprenticeship for juniors',
          'Spontaneous cross-functional friction sparks non-linear breakthroughs',
          'Protection against blurred work-life psychological burnout'
        ],
        counteredPoints: [lastOpp?.claim || 'Asynchronous documentation solves mentorship'],
        strengthScore: round === 1 ? 88 : 91,
      };
    }
  }

  private generateSocialMediaArgument(
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      return {
        claim: 'Strict regulatory frameworks are essential to curb algorithmic dopamine exploitation and protect democratic integrity.',
        content: 'Engagement-maximizing recommendation algorithms are weaponized to hijack neurochemistry, creating digital addiction loops, documented teenage mental health crises, and hyper-polarized information silos. Just as pharmaceuticals and aviation are regulated for consumer safety, algorithmic platforms wielding planetary influence must be subject to mandatory transparency, auditability, and safety guardrails.',
        supportingPoints: [
          'Dopamine slot-machine UX designs knowingly target vulnerable demographics',
          'Algorithmic amplification of sensationalism degrades civic discourse',
          'Systemic lack of transparency requires independent statutory auditing'
        ],
        counteredPoints: lastOpp ? [lastOpp.claim] : [],
        strengthScore: 91,
      };
    } else {
      return {
        claim: 'State-mandated content controls inevitably morph into partisan speech policing and stifle decentralized free expression.',
        content: 'Granting bureaucratic agencies or monopolistic platforms statutory power to arbitrate "acceptable discourse" creates an authoritarian vector ripe for political abuse. History proves that speech regulations disproportionately silence whistleblowers and minority dissidence. The legitimate answer is user algorithmic choice and literacy, not state paternalism.',
        supportingPoints: [
          'Regulatory capture turns speech boards into ideological censorship tools',
          'Chilling effect on investigative journalism and dissident speech',
          'User sovereign filtering and decentralized protocols preserve open discourse'
        ],
        counteredPoints: [lastOpp?.claim || 'Algorithms must be regulated like pharmaceuticals'],
        strengthScore: 89,
      };
    }
  }

  private generateOpenSourceArgument(
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      return {
        claim: 'Open source ensures transparent auditability, prevents vendor lock-in, and fuels collective global advancement.',
        content: 'Proprietary software operates as an opaque black box subject to arbitrary deprecation, price gouging, and hidden telemetry. Open source software democratizes foundational tooling, allows world-wide security peer review under Kerckhoffs principle, and forms the bedrock of modern internet infrastructure.',
        supportingPoints: [
          'Universal code auditability eliminates hidden surveillance',
          'Elimination of enterprise rent-seeking and vendor hostage scenarios',
          'Distributed global collaboration accelerates collective standards'
        ],
        counteredPoints: lastOpp ? [lastOpp.claim] : [],
        strengthScore: 90,
      };
    } else {
      return {
        claim: 'Proprietary models incentivize capitalized research, provide guaranteed SLA indemnification, and safeguard supply chains.',
        content: 'Commercial software guarantees institutional accountability, continuous security patching, and full legal indemnification. Open source projects frequently suffer from catastrophic maintainer burnout, critical zero-day vulnerabilities in neglected sub-dependencies (like Log4j or XZ utils), and zero warranty when enterprises face existential data breaches.',
        supportingPoints: [
          'Enforceable enterprise SLAs and financial legal indemnification',
          'Capital reinvestment powers high-capital R&D and polished UX',
          'Open source supply chain vulnerability to social engineering and abandonment'
        ],
        counteredPoints: [lastOpp?.claim || 'Open source is safer because of many eyes'],
        strengthScore: 88,
      };
    }
  }

  private generateAttendanceArgument(
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      return {
        claim: 'Structured attendance establishes academic discipline, collaborative peer discourse, and verified learning outcomes.',
        content: 'Higher education is an interactive cohort experience, not a passive consumer streaming service. Mandatory attendance ensures students engage in synchronous debate, hands-on lab experiments, and collaborative problem-solving that build the soft skills employers demand.',
        supportingPoints: ['Synchronous peer exchange fosters critical dialectical reasoning', 'Statistically higher course completion rates among attendee cohorts'],
        counteredPoints: lastOpp ? [lastOpp.claim] : [],
        strengthScore: 86,
      };
    } else {
      return {
        claim: 'Mandatory attendance enforces an outdated pedagogical crutch that penalizes student autonomy and mastery-based learning.',
        content: 'University students are legal adults who should be evaluated on mastery of learning objectives, not seat time. Mandatory attendance policies punish working students, caregivers, and self-directed learners while incentivizing disengaged physical presence over genuine intellectual curiosity.',
        supportingPoints: ['Outcome-based mastery versus performative compliance', 'Inclusivity for non-traditional and financially self-supporting students'],
        counteredPoints: [lastOpp?.claim || 'Physical presence guarantees real learning'],
        strengthScore: 91,
      };
    }
  }

  private generateTrustCodeArgument(
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      return {
        claim: 'AI-generated code subject to automated integration pipelines meets or exceeds human production standards.',
        content: 'Trust in production code does not stem from human pride; it stems from comprehensive unit testing, automated fuzzing, type invariants, and continuous integration. Code synthesized by LLMs and validated by deterministic test suites exhibits lower syntax defect density than fatigue-prone late-night human commits.',
        supportingPoints: ['Deterministic test coverage verifies runtime execution regardless of author', 'Exhaustive edge-case synthesis speeds up bug remediation'],
        counteredPoints: lastOpp ? [lastOpp.claim] : [],
        strengthScore: 88,
      };
    } else {
      return {
        claim: 'Statistical pattern matching cannot reason about architectural state drift, leading to brittle production debt.',
        content: 'LLMs generate code that looks convincing on the surface but frequently harbors subtle logical edge cases, deprecated concurrency models, and hallucinated security vulnerabilities. Entrusting production runtime to probabilistic generation without deep human architectural ownership is engineering recklessness.',
        supportingPoints: ['Surface plausibility masks catastrophic concurrency and memory leaks', 'Diffusion of technical responsibility when production breaks down'],
        counteredPoints: [lastOpp?.claim || 'Test suites catch all AI-generated faults'],
        strengthScore: 90,
      };
    }
  }

  private generateGenericArgument(
    topic: string,
    role: 'pro' | 'con',
    round: number,
    isOpening: boolean,
    lastOpp?: any
  ): GeneratedArgument {
    if (role === 'pro') {
      return {
        claim: round === 1
          ? `The core proposition of "${topic}" unlocks transformative societal progress and systemic efficiency.`
          : `Affirmative principles address the counterarguments directly while maximizing equitable long-term outcomes.`,
        content: round === 1
          ? `When examining "${topic}", the fundamental evidence highlights substantial benefits. Modern institutions require dynamic adaptation, evidence-based iteration, and proactive solutions. Embracing this direction dismantles outdated inefficiencies and creates a sustainable framework for future growth.`
          : `While the opposition raises cautionary questions, their stance defends the status quo at the expense of necessary evolution. Addressing "${topic}" with intentional safeguards and clear oversight delivers measurable advantages that far outweigh passive inaction.`,
        supportingPoints: [
          'Proactive systemic adaptation to contemporary conditions',
          'Measurable efficiency dividends and resource optimization',
          'Long-term sustainability over reactionary resistance'
        ],
        counteredPoints: lastOpp ? [lastOpp.claim] : [],
        strengthScore: 87,
      };
    } else {
      return {
        claim: round === 1
          ? `The proposition for "${topic}" introduces critical unintended consequences and ignores core ethical trade-offs.`
          : `Rigorous analysis proves that the affirmative model compromises resilience and shifts severe hidden costs onto stakeholders.`,
        content: round === 1
          ? `Adopting "${topic}" without addressing structural vulnerabilities creates catastrophic second-order effects. The affirmative relies on idealized assumptions while minimizing implementation friction, accountability vacuums, and real-world failure modes. Prudent policy demands rigorous skepticism.`
          : `The affirmative's reassurances remain theoretical. In practical execution, the risks of "${topic}" destabilize core equilibria. We must prioritize sustainable, battle-tested solutions rather than reckless accelerationism.`,
        supportingPoints: [
          'High probability of severe second-order systemic disruptions',
          'Accountability and governance deficits in execution',
          'Pragmatic alternative paradigms offer superior risk-reward profiles'
        ],
        counteredPoints: [lastOpp?.claim || 'Systemic efficiency outweighs cautionary risks'],
        strengthScore: 89,
      };
    }
  }

  public async evaluateDebate(context: DebateEvaluationContext): Promise<JudgeEvaluation> {
    await new Promise((res) => setTimeout(res, 800));

    const { topic, category, transcript } = context;
    const proArgs = transcript.filter((m) => m.role === 'pro');
    const conArgs = transcript.filter((m) => m.role === 'con');

    // Calculate heuristic rubric scores based on argument count, depth, and strength
    const proAvgStrength = proArgs.length > 0
      ? proArgs.reduce((acc, m) => acc + (m.strengthScore || 85), 0) / proArgs.length
      : 85;
    const conAvgStrength = conArgs.length > 0
      ? conArgs.reduce((acc, m) => acc + (m.strengthScore || 87), 0) / conArgs.length
      : 87;

    // Base rubric numbers with slight variation
    const proLogical = Math.min(98, Math.round(proAvgStrength + (Math.random() * 4 - 2)));
    const conLogical = Math.min(98, Math.round(conAvgStrength + (Math.random() * 4 - 2)));

    const proEvidence = Math.min(96, Math.round(proAvgStrength - 1 + (Math.random() * 4 - 2)));
    const conEvidence = Math.min(96, Math.round(conAvgStrength + (Math.random() * 4 - 2)));

    const proRebuttal = Math.min(97, Math.round(proAvgStrength + (Math.random() * 4 - 2)));
    const conRebuttal = Math.min(97, Math.round(conAvgStrength + 1 + (Math.random() * 4 - 2)));

    const proRelevance = Math.min(99, Math.round(91 + (Math.random() * 4 - 2)));
    const conRelevance = Math.min(99, Math.round(90 + (Math.random() * 4 - 2)));

    const proClarity = Math.min(98, Math.round(89 + (Math.random() * 4 - 2)));
    const conClarity = Math.min(98, Math.round(90 + (Math.random() * 4 - 2)));

    // Rubric Weights:
    // Logical consistency: 25%
    // Evidence & supporting examples: 25%
    // Rebuttal quality: 20%
    // Relevance to topic: 15%
    // Clarity and structure: 15%
    const proWeighted = Math.round(
      (proLogical * 0.25 +
       proEvidence * 0.25 +
       proRebuttal * 0.20 +
       proRelevance * 0.15 +
       proClarity * 0.15) * 10
    ) / 10;

    const conWeighted = Math.round(
      (conLogical * 0.25 +
       conEvidence * 0.25 +
       conRebuttal * 0.20 +
       conRelevance * 0.15 +
       conClarity * 0.15) * 10
    ) / 10;

    const margin = Math.round(Math.abs(proWeighted - conWeighted) * 10) / 10;
    const winner: 'pro' | 'con' | 'tie' =
      margin < 0.5 ? 'tie' : proWeighted > conWeighted ? 'pro' : 'con';

    const winnerName = winner === 'pro' ? 'Affirmative (PRO)' : winner === 'con' ? 'Opposition (CON)' : 'Draw / Deadlock';

    const verdictTitle = winner === 'pro'
      ? `Affirmative Victory: Principled Vision and Structural Efficiency Prevail`
      : winner === 'con'
      ? `Opposition Victory: Rigorous Liability and Critical Edge-Cases Carry the Day`
      : `Equitable Tie: Competing Frameworks Balanced Across All Rubric Dimensions`;

    const proKeyPoint = proArgs[0]?.claim || 'Foundational productivity and systemic innovation arguments';
    const conKeyPoint = conArgs[0]?.claim || 'Critical systemic governance and accountability trade-offs';

    return {
      proScore: proWeighted,
      conScore: conWeighted,
      winner,
      margin,
      verdictTitle,
      breakdown: {
        logicalConsistency: {
          pro: proLogical,
          con: conLogical,
          weight: 0.25,
          proNotes: 'Affirmative maintained a cohesive narrative arch, though occasionally relied on optimistic deployment trajectories.',
          conNotes: 'Opposition demonstrated high analytical rigor by uncovering latent contradictions and accountability vacuums.',
        },
        evidenceAndExamples: {
          pro: proEvidence,
          con: conEvidence,
          weight: 0.25,
          proNotes: 'Strong historical analogies and empirical metrics cited across multiple turns.',
          conNotes: 'High-impact counter-examples and practical institutional precedents introduced effectively.',
        },
        rebuttalQuality: {
          pro: proRebuttal,
          con: conRebuttal,
          weight: 0.20,
          proNotes: 'Directly tackled the opposition\'s claims by proposing verification safeguards.',
          conNotes: 'Extremely sharp line-by-line deconstruction of affirmative assumptions.',
        },
        relevance: {
          pro: proRelevance,
          con: conRelevance,
          weight: 0.15,
          proNotes: 'Addressed the core motion without wandering into peripheral distractions.',
          conNotes: 'Held the debate strictly to the precise wording and real-world implications of the motion.',
        },
        clarityAndStructure: {
          pro: proClarity,
          con: conClarity,
          weight: 0.15,
          proNotes: 'Crisp rhetoric with structured claims and supportive rationale.',
          conNotes: 'Eloquent delivery with compelling rhetorical cadences and strong closures.',
        },
      },
      executiveRationale: `In this closely contested exchange on "${topic}", ${winnerName} demonstrated a slight edge (${Math.max(proWeighted, conWeighted)} vs ${Math.min(proWeighted, conWeighted)}). The winning team stood out particularly in rebuttal precision and empirical evidence depth, answering each opponent challenge with structural substance.`,
      strongestArgumentPro: proKeyPoint,
      strongestArgumentCon: conKeyPoint,
      weakestArgumentPro: proArgs[proArgs.length - 1]?.claim || 'Over-reliance on future verification frameworks without addressing immediate transition costs.',
      weakestArgumentCon: conArgs[conArgs.length - 1]?.claim || 'Occasional defensive inertia that offered fewer proactive alternative models.',
      keyCounterarguments: [
        'Deterministic verification and safety sandboxes can mitigate probabilistic defects.',
        'Human accountability and moral agency cannot be outsourced to statistical distribution weights.'
      ],
      neutralSummary: `The debate on "${topic}" provided an exemplary showcase of dialectical inquiry. The Affirmative highlighted transformative potential and efficiency gains, while the Opposition anchored the conversation in ethics, accountability, and the preservation of human agency.`,
      suggestionsForWeakerSide: winner === 'pro'
        ? 'The Opposition should propose concrete alternative governance structures rather than relying solely on precautionary skepticism.'
        : 'The Affirmative should directly resolve the liability vacuum and address worst-case edge scenarios rather than relying on future technological maturity.',
      evaluatedAt: new Date().toISOString(),
    };
  }
}
