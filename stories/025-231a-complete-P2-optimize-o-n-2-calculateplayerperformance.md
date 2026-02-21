---
id: 025-231a
title: Optimize O(n^2) calculatePlayerPerformance
status: complete
priority: P2
created: "2026-02-21T10:26:16.470Z"
updated: "2026-02-21T11:17:03.929Z"
dependencies: []
---

# Optimize O(n^2) calculatePlayerPerformance

## Problem Statement

calculatePlayerPerformance in statisticsUtils.ts has nested loops over all matches for each player, giving O(n^2) complexity.

## Acceptance Criteria

- [ ] Pre-index matches by playerId before iterating players
- [ ] Verify same results with optimized implementation

## Files

- client/src/utils/statisticsUtils.ts

## Work Log

### 2026-02-21T11:17:03.878Z - Pre-indexed matches by playerId with Map before iterating players, O(n) instead of O(n*m)

