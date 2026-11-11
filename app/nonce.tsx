'use client';

import { createContext } from 'react';

// The document nonce belongs to SSR and hydration, not to navigation payloads.
export const NonceContext = createContext('');
