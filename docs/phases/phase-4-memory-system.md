# Phase 4: Memory System (Week 4)

## Goal
Ensure the chatbot remembers previous interactions within a session for multi-turn conversations.

## Deliverables
- [ ] Database schema for conversation storage
- [ ] Memory retrieval logic
- [ ] Session management (Redis or Postgres)

## Storage Schema
```sql
conversations (id, project_id, user_id, message, response, timestamp)
```

## Checklist
- [ ] Implement conversation persisting
- [ ] Retrieve last N messages for context
- [ ] Handle session timeouts and cleanup
- [ ] Verify memory retention across navigation
