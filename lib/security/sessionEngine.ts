import type { SecurityRole } from "./roleEngine";

export interface SessionPrincipal {
  userId: string;
  platformId: string;
  tenantId: string;
  roles: SecurityRole[];
}

export interface SessionRecord {
  id: string;
  principal: SessionPrincipal;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface SessionValidationResult {
  valid: boolean;
  reason: string;
}

export function createSession(principal: SessionPrincipal, ttlMinutes = 60): SessionRecord {
  const now = new Date();
  const expires = new Date(now.getTime() + ttlMinutes * 60_000);

  return {
    id: `sess-${principal.userId}-${now.getTime()}`,
    principal,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export function revokeSession(session: SessionRecord): SessionRecord {
  return {
    ...session,
    revokedAt: new Date().toISOString(),
  };
}

export function validateSession(session: SessionRecord, nowIso = new Date().toISOString()): SessionValidationResult {
  if (session.revokedAt) {
    return {
      valid: false,
      reason: "Session revoked.",
    };
  }

  const now = new Date(nowIso).getTime();
  const expiry = new Date(session.expiresAt).getTime();

  if (Number.isNaN(now) || Number.isNaN(expiry)) {
    return {
      valid: false,
      reason: "Invalid session timestamps.",
    };
  }

  if (expiry <= now) {
    return {
      valid: false,
      reason: "Session expired.",
    };
  }

  return {
    valid: true,
    reason: "Session valid.",
  };
}
