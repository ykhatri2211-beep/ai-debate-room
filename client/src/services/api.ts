import {
  DebateSession,
  CreateDebateDto,
  DashboardStats,
  LLMHealthStatus,
  ArgumentMessage,
  JudgeEvaluation
} from '../types/debate';

const API_BASE = '/api';

export const api = {
  // Health & Provider
  async getHealth(): Promise<{ status: string; service: string; llm: any }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch API health');
    return res.json();
  },

  async getLLMStatus(): Promise<LLMHealthStatus> {
    const res = await fetch(`${API_BASE}/llm/status`);
    if (!res.ok) throw new Error('Failed to fetch LLM status');
    return res.json();
  },

  async setLLMConfig(config: { providerType: string; apiKey?: string; baseUrl?: string; model?: string }) {
    const res = await fetch(`${API_BASE}/llm/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update LLM configuration');
    return res.json();
  },

  // Stats
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Debates CRUD
  async getDebates(): Promise<DebateSession[]> {
    const res = await fetch(`${API_BASE}/debates`);
    if (!res.ok) throw new Error('Failed to fetch debates');
    return res.json();
  },

  async getDebate(id: string): Promise<DebateSession> {
    const res = await fetch(`${API_BASE}/debates/${id}`);
    if (!res.ok) throw new Error('Debate not found');
    return res.json();
  },

  async createDebate(dto: CreateDebateDto): Promise<DebateSession> {
    const res = await fetch(`${API_BASE}/debates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create debate' }));
      throw new Error(err.error || 'Failed to create debate');
    }
    return res.json();
  },

  async deleteDebate(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/debates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete debate');
  },

  // Turn Execution
  async executeTurn(sessionId: string): Promise<{
    session: DebateSession;
    newMessage?: ArgumentMessage;
    isFinished: boolean;
    judgeReport?: JudgeEvaluation;
  }> {
    const res = await fetch(`${API_BASE}/debates/${sessionId}/turn`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Turn execution failed' }));
      throw new Error(err.error || 'Turn execution failed');
    }
    return res.json();
  },

  async submitHumanTurn(sessionId: string, content: string, claim?: string): Promise<{
    session: DebateSession;
    newMessage?: ArgumentMessage;
    isFinished: boolean;
    judgeReport?: JudgeEvaluation;
  }> {
    const res = await fetch(`${API_BASE}/debates/${sessionId}/human-turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, claim }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Submission failed' }));
      throw new Error(err.error || 'Submission failed');
    }
    return res.json();
  },

  async finalizeDebate(sessionId: string, forceEarly: boolean = false): Promise<{
    session: DebateSession;
    isFinished: boolean;
    judgeReport: JudgeEvaluation;
  }> {
    const res = await fetch(`${API_BASE}/debates/${sessionId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forceEarly }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Adjudication failed' }));
      throw new Error(err.error || 'Adjudication failed');
    }
    return res.json();
  },

  async updateDebateStatus(sessionId: string, status: string): Promise<DebateSession> {
    const res = await fetch(`${API_BASE}/debates/${sessionId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Status update failed');
    return res.json();
  },
};
