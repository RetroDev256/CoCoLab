import { vi } from 'vitest';

import { describe, it , expect, afterEach } from 'vitest';
import { getUser } from '../project.js';

describe('getUser', () => {
    it("should do a thing", async () => {
        await expect(getUser(null)).rejects.toThrow("send failed")
    });

    it("should return", async () => {
        await expect(getUser(1)).toBe("hello");
    })
})