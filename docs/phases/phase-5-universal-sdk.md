# Phase 5: Universal SDK (Week 5)

## Goal
Enable easy integration of the chatbot into any external website with minimal code.

## Deliverables
- [ ] Embeddable script (JS snippet)
- [ ] SDK initialization methods
- [ ] Cross-origin communication (PostMessage)

## Usage Example
```javascript
import { OmniChat } from 'omnichat-sdk';

OmniChat.init({
  apiKey: 'YOUR_API_KEY',
  theme: 'dark'
});
```

## Checklist
- [ ] Build bundled version of the chat widget
- [ ] Implement secure API key authentication
- [ ] Handle CSS isolation (Shadow DOM)
- [ ] Create documentation for SDK integration
