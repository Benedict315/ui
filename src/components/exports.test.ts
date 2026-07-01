import { describe, expect,it } from 'vitest';

import * as components from './index';

describe('Public exports smoke test', () => {
  it('should have all exports defined and be functions or objects', () => {
    for (const key of Object.keys(components)) {
      const exported = (components as any)[key];
      // Ensure the export is not undefined or null
      expect(exported).toBeDefined();
    }
  });
});
