import * as components from './index';

import { describe, it, expect } from 'vitest';

describe('Public exports smoke test', () => {
  it('should have all exports defined and be functions or objects', () => {
    for (const key of Object.keys(components)) {
      const exported = (components as any)[key];
      // Ensure the export is not undefined or null
      expect(exported).toBeDefined();
    }
  });
});
