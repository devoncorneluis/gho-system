import type { WorkflowDefinition } from "../../types/workflow";

export const AUTOMATION_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "driver-rejection-reassignment",
    name: "Driver rejection reassignment workflow",
    triggerEventTypes: ["driver_rejected", "driver_response"],
    steps: [
      {
        id: "wait-30s",
        name: "Wait 30 seconds",
        conditions: [
          { field: "payload.driverResponse", operator: "eq", value: "rejected" },
        ],
        action: { type: "wait", payload: { ms: 30000 } },
      },
      {
        id: "generate-reco",
        name: "Generate recommendation",
        conditions: [
          { field: "payload.driverResponse", operator: "eq", value: "rejected" },
        ],
        action: { type: "generate_recommendation" },
      },
      {
        id: "notify-dispatch",
        name: "Notify dispatcher",
        action: {
          type: "notify",
          payload: {
            title: "Driver rejected dispatch",
            message: "Replacement recommendation is being generated.",
            severity: "high",
            priority: "p2",
            audience: ["dispatch_team"],
          },
        },
      },
      {
        id: "audit",
        name: "Record audit",
        action: { type: "record_audit", payload: { message: "Driver rejection workflow executed." } },
      },
      {
        id: "ops-update",
        name: "Update operations centre",
        action: { type: "update_operations" },
      },
    ],
  },
  {
    id: "delay-escalation",
    name: "Delay escalation workflow",
    triggerEventTypes: ["trip_delayed", "pickup_overdue", "sla_breach"],
    steps: [
      {
        id: "escalate",
        name: "Escalate delayed trip",
        action: { type: "escalate", payload: { tag: "delay" } },
      },
      {
        id: "notify-ops",
        name: "Notify operations",
        action: {
          type: "notify",
          payload: {
            title: "Delay detected",
            message: "Trip delay has crossed threshold and requires action.",
            severity: "high",
            priority: "p2",
            audience: ["operations_team"],
          },
        },
      },
      {
        id: "audit",
        name: "Record audit",
        action: { type: "record_audit", payload: { message: "Delay workflow executed." } },
      },
    ],
  },
  {
    id: "emergency-response",
    name: "Emergency response workflow",
    triggerEventTypes: ["emergency", "gps_offline"],
    steps: [
      {
        id: "escalate-emergency",
        name: "Escalate emergency",
        action: { type: "escalate", payload: { tag: "emergency" } },
      },
      {
        id: "notify-safety",
        name: "Notify safety",
        action: {
          type: "notify",
          payload: {
            title: "Emergency signal",
            message: "Immediate safety intervention required.",
            severity: "critical",
            priority: "p1",
            audience: ["safety_team"],
          },
        },
      },
      {
        id: "audit-emergency",
        name: "Record emergency audit",
        action: { type: "record_audit", payload: { message: "Emergency workflow executed." } },
      },
    ],
  },
];

export function getWorkflowsForEventType(eventType: string): WorkflowDefinition[] {
  return AUTOMATION_WORKFLOWS.filter((workflow) => workflow.triggerEventTypes.includes(eventType));
}
