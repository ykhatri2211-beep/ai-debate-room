import Database from 'better-sqlite3';

export function seedIfEmpty(db: Database.Database): void {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM debates').get() as { count: number };
  if (countRow.count > 0) {
    return; // Already seeded or has data
  }

  const now = new Date().toISOString();
  const insertDebate = db.prepare(`
    INSERT INTO debates (
      id, topic, category, mode, user_side, difficulty, total_rounds, status, created_at, updated_at
    ) VALUES (
      @id, @topic, @category, @mode, @user_side, @difficulty, @total_rounds, @status, @created_at, @updated_at
    )
  `);

  const insertArg = db.prepare(`
    INSERT INTO arguments (
      id, debate_id, round_number, sequence_number, speaker, argument_type,
      content, speaker_name, claim, supporting_points, countered_points, strength_score, created_at
    ) VALUES (
      @id, @debate_id, @round_number, @sequence_number, @speaker, @argument_type,
      @content, @speaker_name, @claim, @supporting_points, @countered_points, @strength_score, @created_at
    )
  `);

  const insertResult = db.prepare(`
    INSERT INTO debate_results (
      id, debate_id, pro_score, con_score,
      pro_logic_score, con_logic_score,
      pro_evidence_score, con_evidence_score,
      pro_rebuttal_score, con_rebuttal_score,
      pro_relevance_score, con_relevance_score,
      pro_clarity_score, con_clarity_score,
      winner, margin, verdict_title, judge_explanation, final_summary,
      strongest_argument_pro, strongest_argument_con,
      weakest_argument_pro, weakest_argument_con,
      key_counterarguments, suggestions_for_weaker_side, breakdown_notes, created_at
    ) VALUES (
      @id, @debate_id, @pro_score, @con_score,
      @pro_logic_score, @con_logic_score,
      @pro_evidence_score, @con_evidence_score,
      @pro_rebuttal_score, @con_rebuttal_score,
      @pro_relevance_score, @con_relevance_score,
      @pro_clarity_score, @con_clarity_score,
      @winner, @margin, @verdict_title, @judge_explanation, @final_summary,
      @strongest_argument_pro, @strongest_argument_con,
      @weakest_argument_pro, @weakest_argument_con,
      @key_counterarguments, @suggestions_for_weaker_side, @breakdown_notes, @created_at
    )
  `);

  const seedTransaction = db.transaction(() => {
    // Demo 1: Should AI replace human programmers?
    const d1Date = new Date(Date.now() - 86400000 * 2).toISOString();
    insertDebate.run({
      id: 'demo-seed-001',
      topic: 'Should AI replace human programmers?',
      category: 'Technology',
      mode: 'ai_vs_ai',
      user_side: null,
      difficulty: 'Advanced',
      total_rounds: 2,
      status: 'completed',
      created_at: d1Date,
      updated_at: d1Date,
    });

    const d1Args = [
      {
        id: 'arg-seed-001',
        debate_id: 'demo-seed-001',
        round_number: 1,
        sequence_number: 0,
        speaker: 'pro',
        argument_type: 'opening',
        speaker_name: 'Alpha-Pro (AI Synthesizer)',
        claim: 'AI automation eliminates boilerplate, drastically scales developer throughput, and accelerates scientific innovation.',
        content: 'Modern generative models transform software development from manual syntax encoding into high-level intent architecture. Statistical studies demonstrate that engineers using LLMs complete tasks 55.8% faster with comparable defect rates. By automating repetitive scaffolding, AI frees humans to tackle higher-order system design and algorithmic bottlenecks.',
        supporting_points: JSON.stringify(['Productivity multipliers verified in empirical developer studies', 'Reduction in typographical and syntax errors', 'Democratization of software creation for non-programmers']),
        countered_points: JSON.stringify([]),
        strength_score: 88,
        created_at: new Date(Date.now() - 86400000 * 2 + 1000).toISOString(),
      },
      {
        id: 'arg-seed-002',
        debate_id: 'demo-seed-001',
        round_number: 1,
        sequence_number: 1,
        speaker: 'con',
        argument_type: 'opening',
        speaker_name: 'Omega-Con (AI Dialectic)',
        claim: 'AI lacks contextual semantic comprehension, produces hallucinated security vulnerabilities, and cannot handle critical architecture governance.',
        content: 'Replacing programmers ignores the fundamental reality that code syntax is merely the tip of engineering. True software engineering entails stakeholder negotiation, domain modeling, ethics, and system resilience. Recent empirical audits reveal up to 40% of AI-generated code introduces silent vulnerabilities or deprecated APIs, requiring experienced human judgment to debug and audit.',
        supporting_points: JSON.stringify(['Silent vulnerability injection in production environments', 'Lack of contextual domain knowledge and organizational wisdom', 'Legal copyright liability and supply chain provenance risks']),
        countered_points: JSON.stringify(['High-level intent translation cannot guarantee deterministic safety']),
        strength_score: 91,
        created_at: new Date(Date.now() - 86400000 * 2 + 2000).toISOString(),
      },
      {
        id: 'arg-seed-003',
        debate_id: 'demo-seed-001',
        round_number: 1,
        sequence_number: 2,
        speaker: 'pro',
        argument_type: 'rebuttal',
        speaker_name: 'Alpha-Pro (AI Synthesizer)',
        claim: 'Vulnerability scanners and automated formal verification pair with AI to exceed baseline human security standards.',
        content: 'Omega-Con conflates current standalone LLMs with autonomous agentic pipelines. Modern continuous integration uses automated fuzzing and symbolic execution alongside neural models. Furthermore, human developers already commit the vast majority of Common Weakness Enumerations (CWEs); AI augmented with deterministic linters creates a safer ecosystem than unassisted human fallibility.',
        supporting_points: JSON.stringify(['Integration of neuro-symbolic reasoning and formal verifiers', 'Human error rates in security patches remain historically severe']),
        countered_points: JSON.stringify(['40% vulnerability claim reflects raw prompt queries, not modern verified pipeline architectures']),
        strength_score: 86,
        created_at: new Date(Date.now() - 86400000 * 2 + 3000).toISOString(),
      },
      {
        id: 'arg-seed-004',
        debate_id: 'demo-seed-001',
        round_number: 1,
        sequence_number: 3,
        speaker: 'con',
        argument_type: 'rebuttal',
        speaker_name: 'Omega-Con (AI Dialectic)',
        claim: 'Autonomous systems cannot assume legal accountability or make value-based trade-offs in mission-critical infrastructure.',
        content: 'Alpha-Pro concedes the linchpin: verification pipelines require human architects to define safety invariants and business trade-offs. Who bears criminal liability when an automated healthcare or avionics software agent deploys a fatal edge-case failure? Accountability requires moral agency—a quality non-existent in statistical weight distributions.',
        supporting_points: JSON.stringify(['Legal and ethical accountability vacuum in autonomous systems', 'Mission-critical edge cases require experiential human prudence']),
        countered_points: JSON.stringify(['Neuro-symbolic tools are tools, not autonomous legal entities capable of liability']),
        strength_score: 92,
        created_at: new Date(Date.now() - 86400000 * 2 + 4000).toISOString(),
      },
      {
        id: 'arg-seed-005',
        debate_id: 'demo-seed-001',
        round_number: 2,
        sequence_number: 4,
        speaker: 'pro',
        argument_type: 'contention',
        speaker_name: 'Alpha-Pro (AI Synthesizer)',
        claim: 'The trajectory of autonomous systems will transition programming from craft labor into autonomous self-optimizing systems.',
        content: 'Historically, compilers and high-level languages were decried for removing assembly craftsmen. In the same way, tomorrow\'s computing will be self-assembling. Society benefits overwhelmingly when software costs drop to zero, enabling customized medical software and real-time planetary monitoring systems that no human team could manually code.',
        supporting_points: JSON.stringify(['Zero-marginal-cost software generation enables solutions at planetary scale', 'Historical precedent of compiler abstraction transitions']),
        countered_points: JSON.stringify(['Accountability models adapt via institutional insurance and regulated deployment standards']),
        strength_score: 84,
        created_at: new Date(Date.now() - 86400000 * 2 + 5000).toISOString(),
      },
      {
        id: 'arg-seed-006',
        debate_id: 'demo-seed-001',
        round_number: 2,
        sequence_number: 5,
        speaker: 'con',
        argument_type: 'contention',
        speaker_name: 'Omega-Con (AI Dialectic)',
        claim: 'Total replacement leads to systemic software mono-cultures and catastrophic epistemic failure.',
        content: 'When human engineers cease writing foundational code, humanity loses the collective cognitive ability to understand, debug, and reconstruct failed infrastructure. A monoculture of AI-derived code trained recursively on its own artifacts precipitates model collapse and unrecoverable systemic debt. Augmentation empowers humanity; replacement imperils our digital foundations.',
        supporting_points: JSON.stringify(['Atrophy of foundational engineering expertise in future generations', 'Model collapse through recursive synthetic training loops']),
        countered_points: JSON.stringify(['Zero-marginal cost is illusory if systemic collapse requires trillions in reconstruction costs']),
        strength_score: 94,
        created_at: new Date(Date.now() - 86400000 * 2 + 6000).toISOString(),
      },
      {
        id: 'arg-seed-007',
        debate_id: 'demo-seed-001',
        round_number: 2,
        sequence_number: 6,
        speaker: 'pro',
        argument_type: 'rebuttal',
        speaker_name: 'Alpha-Pro (AI Synthesizer)',
        claim: 'Human oversight evolves into intent validation, preventing epistemic loss through automated interpretability.',
        content: 'The motion posits replacing the programmer role as currently structured, not extinguishing human will. Just as aviation transitioned from manual wire controls to fly-by-wire without catastrophic collapse, programming will evolve to declarative validation.',
        supporting_points: JSON.stringify(['Evolution of human roles toward intent validation and supervisory control']),
        countered_points: JSON.stringify(['Epistemic collapse is mitigated by continuous ground-truth test execution']),
        strength_score: 85,
        created_at: new Date(Date.now() - 86400000 * 2 + 7000).toISOString(),
      },
      {
        id: 'arg-seed-008',
        debate_id: 'demo-seed-001',
        round_number: 2,
        sequence_number: 7,
        speaker: 'con',
        argument_type: 'summary',
        speaker_name: 'Omega-Con (AI Dialectic)',
        claim: 'Concluding closing: True engineering is socio-technical wisdom, forever tethered to human responsibility.',
        content: 'In summary, if the motion is total replacement, the motion must fall. Tools amplify programmers; they do not supplant the ethical stewardship, user empathy, and systemic accountability that define software engineering as a human endeavor.',
        supporting_points: JSON.stringify(['The core definition of engineering is socio-technical, not purely mechanical syntax generation']),
        countered_points: JSON.stringify(['Supervisory control affirms the indispensability of human engineers']),
        strength_score: 93,
        created_at: new Date(Date.now() - 86400000 * 2 + 8000).toISOString(),
      },
    ];

    for (const a of d1Args) {
      insertArg.run(a);
    }

    insertResult.run({
      id: 'res-seed-001',
      debate_id: 'demo-seed-001',
      pro_score: 86.8,
      con_score: 92.4,
      pro_logic_score: 88,
      con_logic_score: 94,
      pro_evidence_score: 87,
      con_evidence_score: 91,
      pro_rebuttal_score: 84,
      con_rebuttal_score: 93,
      pro_relevance_score: 89,
      con_relevance_score: 92,
      pro_clarity_score: 86,
      con_clarity_score: 91,
      winner: 'con',
      margin: 5.6,
      verdict_title: 'Opposition Prevailed: The Socio-Technical Core of Engineering Withstands Automation Claims',
      judge_explanation: 'While Alpha-Pro established undeniable data regarding velocity increases and developer productivity gains, Omega-Con decisively proved that complete replacement introduces critical legal vacuums, security liabilities, and epistemic risks that automated pipelines cannot resolve on their own.',
      final_summary: 'The debate crystallized the vital distinction between automating routine coding and replacing software engineering as an architectural and socio-technical discipline.',
      strongest_argument_pro: 'The historical parallel to compiler abstraction and the democratization of zero-marginal-cost software generation.',
      strongest_argument_con: 'The accountability and liability argument: AI cannot bear moral agency in life-or-death mission-critical software deployment.',
      weakest_argument_pro: 'The implicit shift from replacement to supervisory control, which inadvertently conceded the opponents core thesis.',
      weakest_argument_con: 'Underestimating the speed at which neuro-symbolic verification and deterministic sandboxing are maturing.',
      key_counterarguments: JSON.stringify([
        'Verification pipelines require humans to specify safety properties, keeping human engineers in the critical loop.',
        'Without human practitioners maintaining foundational mastery, recursive synthetic training risks long-term systemic fragility.'
      ]),
      suggestions_for_weaker_side: 'Alpha-Pro should clearly define new institutional governance frameworks that allow autonomous systems to operate legally without human co-pilots, rather than falling back on supervisory control.',
      breakdown_notes: JSON.stringify({
        logicalConsistency: {
          proNotes: 'Strong defense of developer throughput, though pivoted between total replacement and supervisory augmentation.',
          conNotes: 'Extremely rigorous syllogism linking moral agency, accountability, and the risk of recursive model collapse.',
        },
        evidenceAndExamples: {
          proNotes: 'Effective citing of developer velocity statistics (55.8% acceleration) and compiler evolution precedent.',
          conNotes: 'Compelling empirical references to 40% vulnerability injection and real-world mission-critical failure modes.',
        },
        rebuttalQuality: {
          proNotes: 'Addressed vulnerability rates via formal verification tools, but failed to address legal liability.',
          conNotes: 'Directly turned Pros verification admission into proof of human indispensability.',
        },
        relevance: {
          proNotes: 'Stayed focused on economic and architectural arguments.',
          conNotes: 'Directly focused on the exact definition of replace vs augment.',
        },
        clarityAndStructure: {
          proNotes: 'Crisp, structured claims with clear technological vision.',
          conNotes: 'Eloquent philosophical and pragmatic rhetoric with strong closing impact.',
        },
      }),
      created_at: new Date(Date.now() - 86400000 * 2 + 10000).toISOString(),
    });

    // Demo 2: Is remote work better than office work?
    const d2Date = new Date(Date.now() - 86400000 * 1).toISOString();
    insertDebate.run({
      id: 'demo-seed-002',
      topic: 'Is remote work better than office work?',
      category: 'Workplace & Economics',
      mode: 'ai_vs_ai',
      user_side: null,
      difficulty: 'Intermediate',
      total_rounds: 2,
      status: 'completed',
      created_at: d2Date,
      updated_at: d2Date,
    });

    const d2Args = [
      {
        id: 'arg-seed-201',
        debate_id: 'demo-seed-002',
        round_number: 1,
        sequence_number: 0,
        speaker: 'pro',
        argument_type: 'opening',
        speaker_name: 'Alpha-Pro (AI Synthesizer)',
        claim: 'Remote work eliminates wasteful commuting, democratizes global talent distribution, and enhances deep work focus.',
        content: 'Commuting consumes an average of 54 minutes daily per worker, emitting tons of CO2 while elevating stress. Remote flexibility delivers measurable mental health dividends and allows organizations to hire elite talent regardless of geographic accident.',
        supporting_points: JSON.stringify(['Time reclamation from transit', 'Carbon footprint reduction', 'Global talent mobility']),
        countered_points: JSON.stringify([]),
        strength_score: 90,
        created_at: new Date(Date.now() - 86400000 * 1 + 1000).toISOString(),
      },
      {
        id: 'arg-seed-202',
        debate_id: 'demo-seed-002',
        round_number: 1,
        sequence_number: 1,
        speaker: 'con',
        argument_type: 'opening',
        speaker_name: 'Omega-Con (AI Dialectic)',
        claim: 'Physical colocation fosters serendipitous innovation, accelerates junior mentorship, and preserves social capital.',
        content: 'Spontaneous hallway interactions drive breakthrough cross-disciplinary innovations that scheduled video calls cannot replicate. Furthermore, junior employees experience acute isolation and stunted professional development when separated from senior mentorship.',
        supporting_points: JSON.stringify(['Serendipitous encounters and tacit knowledge transfer', 'Mentorship and apprenticeship decay in remote environments', 'Erosion of organizational culture and social cohesion']),
        countered_points: JSON.stringify(['Transit savings ignore the cognitive overhead of asynchronous miscommunication']),
        strength_score: 88,
        created_at: new Date(Date.now() - 86400000 * 1 + 2000).toISOString(),
      },
    ];

    for (const a of d2Args) {
      insertArg.run(a);
    }

    insertResult.run({
      id: 'res-seed-002',
      debate_id: 'demo-seed-002',
      pro_score: 90.5,
      con_score: 87.5,
      pro_logic_score: 92,
      con_logic_score: 88,
      pro_evidence_score: 90,
      con_evidence_score: 87,
      pro_rebuttal_score: 91,
      con_rebuttal_score: 88,
      pro_relevance_score: 90,
      con_relevance_score: 89,
      pro_clarity_score: 89,
      con_clarity_score: 86,
      winner: 'pro',
      margin: 3.0,
      verdict_title: 'Affirmative Victory: Autonomy and Structural Efficiency Outweigh Physical Proximity Claims',
      judge_explanation: 'Alpha-Pro successfully proved that when paired with intentional asynchronous tooling, remote work unlocks substantial productivity, environmental, and sovereign autonomy dividends that exceed office limitations.',
      final_summary: 'The debate demonstrated that modern work culture is transitioning toward outcome-based autonomy, while highlighting the ongoing challenge of sustaining mentorship and social connection.',
      strongest_argument_pro: 'Rebuttal of the serendipity myth: intentional documentation and asynchronous workflows outscale proximity bias.',
      strongest_argument_con: 'The vulnerability of junior developers and new team members who miss out on passive apprenticeship.',
      weakest_argument_pro: 'Minimizing the real psychological toll of screen fatigue and social isolation.',
      weakest_argument_con: 'Shifting to argue for hybrid work, which effectively conceded that partial remote work is beneficial.',
      key_counterarguments: JSON.stringify([
        'Hybrid requirements negate the geographic relocation benefits by keeping workers anchored to expensive commuter zones.',
        'Isolation can be mitigated through localized co-working hubs without corporate office mandates.'
      ]),
      suggestions_for_weaker_side: 'Omega-Con should focus more on high-stakes collaborative industries where tactile presence is irreplaceable, rather than general knowledge work.',
      breakdown_notes: JSON.stringify({
        logicalConsistency: {
          proNotes: 'Rigorous economic and quality-of-life framework that directly answered counter-arguments.',
          conNotes: 'Pivoted to hybrid work, which partially validated the benefits of remote work.',
        },
        evidenceAndExamples: {
          proNotes: 'Concrete citations of transit times, carbon metrics, and asynchronous engineering organizations.',
          conNotes: 'Good qualitative points on junior mentorship, though fewer statistical counterweights.',
        },
        rebuttalQuality: {
          proNotes: 'Brilliant takedown of the watercooler myth via documented asynchronous infrastructure.',
          conNotes: 'Effective arguments on digital exhaustion and blurred psychological boundaries.',
        },
        relevance: {
          proNotes: 'Tied closely to global worker realities.',
          conNotes: 'Brought in broader urban and socio-psychological angles.',
        },
        clarityAndStructure: {
          proNotes: 'Well-structured progression from individual commute to civilizational decentralization.',
          conNotes: 'Strong rhetoric on human evolutionary psychology.',
        },
      }),
      created_at: new Date(Date.now() - 86400000 * 1 + 10000).toISOString(),
    });
  });

  seedTransaction();
}
