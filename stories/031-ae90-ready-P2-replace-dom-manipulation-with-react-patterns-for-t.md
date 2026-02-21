---
id: 031-ae90
title: Replace DOM manipulation with React patterns for toasts
status: ready
priority: P2
created: "2026-02-21T10:26:24.074Z"
updated: "2026-02-21T10:26:29.377Z"
dependencies: []
---

# Replace DOM manipulation with React patterns for toasts

## Problem Statement

LoginForm.tsx and Navigation.tsx create DOM elements manually for toast notifications instead of using React state and rendering.

## Acceptance Criteria

- [ ] Replace direct DOM manipulation with React state-based toast component
- [ ] Or add a lightweight toast library (react-hot-toast)
- [ ] Remove all document.createElement usage for notifications

## Files

- client/src/components/LoginForm.tsx
- client/src/components/Navigation.tsx

## Work Log

