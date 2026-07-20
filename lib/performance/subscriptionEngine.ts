export interface SubscriptionChannelState {
  name: string;
  isConnected: boolean;
  lastEventAt?: string;
  reconnectAttempts: number;
}

export function buildInitialChannelState(name: string): SubscriptionChannelState {
  return {
    name,
    isConnected: false,
    reconnectAttempts: 0,
  };
}

export function markSubscriptionConnected(state: SubscriptionChannelState): SubscriptionChannelState {
  return {
    ...state,
    isConnected: true,
    reconnectAttempts: 0,
    lastEventAt: new Date().toISOString(),
  };
}

export function markSubscriptionDisconnected(state: SubscriptionChannelState): SubscriptionChannelState {
  return {
    ...state,
    isConnected: false,
    reconnectAttempts: state.reconnectAttempts + 1,
  };
}

export function markSubscriptionEvent(state: SubscriptionChannelState): SubscriptionChannelState {
  return {
    ...state,
    lastEventAt: new Date().toISOString(),
  };
}
