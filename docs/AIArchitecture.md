# AI Architecture

Status vocabulary source: [StatusVocabulary.md](StatusVocabulary.md)

## Objective

The GHO AI Operations layer provides deterministic decision support for dispatchers. It recommends actions and explains the reasoning, but it does not replace dispatcher approval.

## Inputs

| Input | Purpose |
| --- | --- |
| Driver availability | Filters and scores dispatch candidates |
| Driver workload | Balances assignments across available drivers |
| Driver performance | Prefers reliable, on-time drivers |
| Vehicle capacity | Confirms passenger demand can be served |
| Vehicle availability | Prefers vehicles ready for dispatch |
| Route group | Aligns trips with route options and history |
| Pickup times | Supports delay and SLA risk evaluation |
| Historical delays | Predicts likely delay risk |
| Current emergencies | Raises operational risk when dispatch capacity is constrained |
| Active traffic data | Improves route risk when available |
| SLA targets | Guides risk and escalation decisions |

## Scoring Model

The v1.1 scoring model is deterministic and explainable.

| Scoring Area | Factors |
| --- | --- |
| Driver scoring | Availability, workload, on-time score, cancellation rate, emergency incidents, pickup proximity |
| Vehicle scoring | Availability, capacity fit, utilization, maintenance risk |
| Route scoring | Distance, historical delay, live traffic delay when available |
| Delay prediction | Historical route delay, traffic impact, emergencies, demand pressure |
| Confidence | Weighted driver, vehicle, route, and risk fit |
| Risk | Predicted delay, emergencies, driver fit, vehicle fit |

## Recommendation Flow

1. Collect operational context.
2. Score drivers.
3. Score vehicles.
4. Score routes.
5. Predict delay.
6. Calculate risk and confidence.
7. Produce recommended action and explanation.
8. Display in Operations dashboard.
9. Expose the same payload through `/api/ai/recommendations`.

## Extension Points

Future ML integration can replace or augment deterministic functions without changing dashboard contracts:

1. `delayPredictor.ts` can call a trained delay model.
2. `demandForecast.ts` can call a demand forecasting model.
3. `driverScoring.ts` can consume learned driver reliability scores.
4. `vehicleScoring.ts` can consume predictive maintenance risk.
5. `recommendationEngine.ts` can blend deterministic guardrails with ML scores.

## Governance

1. AI recommendations require dispatcher approval.
2. Recommendation explanations must be visible.
3. Future automated actions must include guardrails and audit records.
4. Model changes require validation evidence before release.
