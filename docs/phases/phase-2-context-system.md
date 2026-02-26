# Phase 2: Context System (Week 2)

## Goal
Build an environment-aware chatbot that understands the user's current session and page context.

## Deliverables
- [ ] Context extractor script (Client-side)
- [ ] Dynamic prompt builder (Server-side)
- [ ] Context injection system for AI requests

## Key Features
- **URL Context**: Capture current page and path.
- **Session Context**: User identity and role.
- **App State**: Relevant global state to provide to AI.

## Architecture
```
Chat UI → Context Engine → Prompt Builder → AI
```

## Checklist
- [ ] Define context extraction schema
- [ ] Implement client-side `getContext()` utility
- [ ] Update API to merge context into system prompt
- [ ] Test AI response relevance with vs without context
