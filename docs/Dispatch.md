# Dispatch

## Dispatch Engine

Core scoring is built from:

- driver scoring
- vehicle scoring
- route scoring
- trip optimizer

Output is a structured recommendation with reasons and an optimized plan score.

## Integration Path

Dispatch recommendations are consumed by:

- automation layer for reassignment suggestions
- operations decision support panels

## Future Enhancements

- include historical acceptance trends from analytics snapshots
- include tighter route ETA variance modeling
- include platform-specific dispatch constraints from configuration
