---
id: 030-4903
title: Fix sortPlayerRankings array mutation
status: complete
priority: P2
created: "2026-02-21T10:26:16.474Z"
updated: "2026-02-21T10:48:13.259Z"
dependencies: []
---

# Fix sortPlayerRankings array mutation

## Problem Statement

sortPlayerRankings and sortTeamRankings in rankingUtils.ts use .sort() which mutates the input array in place. This can cause unexpected behavior in React where immutability is expected.

## Acceptance Criteria

- [ ] Spread before sorting: [...rankings].sort()
- [ ] Apply same fix to sortTeamRankings
- [ ] Verify rankings display correctly after change

## Files

- client/src/utils/rankingUtils.ts

## Work Log

### 2026-02-21T10:48:13.206Z - Added spread before sort in sortPlayerRankings and sortTeamRankings: [...rankings].sort() instead of rankings.sort(). Prevents mutation of input arrays.

