import { vi } from 'vitest';

import { describe, it , expect, afterEach } from 'vitest';
import { getOwnerData } from '../project-ownerView';

describe('getOwnerData', () => {
    it("should do a thing", async () => {
        await expect(getOwnerData(null)).rejects.toThrow("send failed")
    });

    it("should return", async () => {
        await expect(getOwnerData(1)).toBe("hello");
    })
})