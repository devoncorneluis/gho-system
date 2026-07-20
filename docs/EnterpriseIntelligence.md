# Enterprise Intelligence

Status vocabulary source: [StatusVocabulary.md](StatusVocabulary.md)

## Architecture

The Enterprise Intelligence Engine centralizes operational decision support for GHO Enterprise v1.1.

```text
Operational State
  -> Core scoring, rules, confidence
  -> Dispatch intelligence
  -> Prediction
  -> Risk
  -> Analytics
  -> Recommendations
  -> Unified snapshot
```

## Data Flow

1. Collect operational state: drivers, vehicles, trips, routes, emergencies, demand history, weather, and security alerts.
2. Score operational entities through the shared scoring engine.
3. Evaluate deterministic rules and risk signals.
4. Generate predictions and forecasts.
5. Produce recommendations with confidence and explanations.
6. Serve the snapshot through `/api/intelligence`.
7. Render the Operations dashboard as a consumer of the shared snapshot.

## Modules

| Module | Purpose |
| --- | --- |
| `core` | Shared types, scoring, rules, confidence, orchestration |
| `dispatch` | Driver selection, route optimization, workload balance, capacity planning |
| `prediction` | Delay, demand, traffic, weather, and fleet forecasts |
| `risk` | Trip, driver, vehicle, SLA, and security risk |
| `analytics` | Utilization, productivity, fleet, cost, and executive insights |
| `recommendations` | Action planning, explanation generation, priority ranking |

## Extension Points

Future ML integration can replace deterministic components without changing API or dashboard contracts:

1. Replace `prediction/delayPredictor.ts` with a trained delay model.
2. Replace `prediction/demandForecast.ts` with historical demand forecasting.
3. Feed real-time traffic and weather providers into prediction modules.
4. Add predictive maintenance models to vehicle risk.
5. Blend deterministic guardrails with ML scores in `core/intelligenceEngine.ts`.

## Governance

1. Pages must not calculate intelligence independently.
2. Recommendations must include explanations.
3. Dispatcher approval remains required for operational actions.
4. Model or scoring changes require test coverage and release evidence.
