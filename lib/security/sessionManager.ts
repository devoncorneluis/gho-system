import type { SessionPrincipal, SessionRecord, SessionValidationResult } from "./sessionEngine";
import { createSession, revokeSession, validateSession } from "./sessionEngine";

export type { SessionPrincipal, SessionRecord, SessionValidationResult };

export interface SessionStore {
  save: (session: SessionRecord) => Promise<void> | void;
  get: (sessionId: string) => Promise<SessionRecord | null> | SessionRecord | null;
  remove: (sessionId: string) => Promise<void> | void;
}

export function createInMemorySessionStore(): SessionStore {
  const store = new Map<string, SessionRecord>();

  return {
    save: async (session: SessionRecord) => {
      store.set(session.id, session);
    },
    get: async (sessionId: string) => {
      return store.get(sessionId) ?? null;
    },
    remove: async (sessionId: string) => {
      store.delete(sessionId);
    },
  };
}

export class SessionManager {
  constructor(private readonly store: SessionStore) {}

  async issue(principal: SessionPrincipal, ttlMinutes = 60): Promise<SessionRecord> {
    const session = createSession(principal, ttlMinutes);
    await this.store.save(session);
    return session;
  }

  async validate(sessionId: string): Promise<SessionValidationResult> {
    const session = await this.store.get(sessionId);
    if (!session) {
      return {
        valid: false,
        reason: "Session not found.",
      };
    }

    return validateSession(session);
  }

  async revoke(sessionId: string): Promise<SessionRecord | null> {
    const session = await this.store.get(sessionId);
    if (!session) return null;
    const revoked = revokeSession(session);
    await this.store.save(revoked);
    return revoked;
  }

  async purge(sessionId: string): Promise<void> {
    await this.store.remove(sessionId);
  }
}
