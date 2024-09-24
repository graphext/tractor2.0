# Google News Extraction Functionality

This document outlines the steps to build a new functionality for extracting Google News using the existing Apify infrastructure.

## Steps

### 1. Define the Actor ID for Google News
- Add a new constant for the Google News Actor ID in `src/lib/apifyEndpoints.ts`.

```typescript
export const GOOGLE_NEWS_ACTOR_ID = 'NRX0F3bI8SjDITLV9';
```
