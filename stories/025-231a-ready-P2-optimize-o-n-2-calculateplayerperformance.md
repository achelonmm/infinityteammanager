---
id: 025-231a
title: Optimize O(n^2) calculatePlayerPerformance
status: ready
priority: P2
created: "2026-02-21T10:26:16.470Z"
updated: "2026-02-21T10:26:29.373Z"
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

