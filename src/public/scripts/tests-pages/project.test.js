import { vi } from 'vitest';

// // Mock ../../main.js (src/public/main.js) before importing project.js so project.js uses these implementations
// vi.mock('../../main.js', () => {
//   return {
//     // selectByValue: return empty array for invalid ids (0, -1), otherwise return a member row for id 1
//     selectByValue: vi.fn(async (table, field, value) => {
//       if (value === 0 || value === -1 || value == null) return [];
//       if (value === 1) return [{ user_id: 1, role: 'member' }];
//       return [];
//     }),
//   };
// });

import { describe, it , expect } from 'vitest';
import * as main from '../../main.js';
import { getUser, renderUser, getMembers, getJoinRequests } from '../project.js';
//import { selectByValue } from '../../main.js';

describe('getUser', () => {
    it("null returns undefined", async () => {
        await expect(getUser(null)).resolves.toThrow("undefined")
    });

    it('valid id returns expected body', async () => {
        const response = {
            id: '1',
            user_name: 'dev_alice',
            pw_hash: { type: 'Buffer', data: [] },
            email: 'alice@example.com',
            created_at: '2026-02-25T07:23:39.098Z',
        };
        await expect(getUser(1)).resolves.toStrictEqual(response);
    });

    //test for invalid numbers, invalid text input
})


describe('renderUser', () => {
    it("null returns undefined", () => {
        expect(renderUser(null)).toBe("undefined");
    });

    it("works with missing values", () => {
        const user = {
            user_name: null,
            email: "alice@example.com"
        }
        expect(renderUser(user)).toBe("undefined")
    })

    it('returns text as expected for valid user', () => {
        const user = { user_name: 'alice', email: 'alice@example.com' };
        const result = ` <div class="flex gap-2 rounded-box bg-base-200 p-3">
                    <div class="avatar avatar-placeholder">
                        <div class="bg-neutral text-neutral-content size-10 rounded-full">
                            <span class="text-2xl">A</span>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm opacity-70">alice</span>
                        <span class="text-sm opacity-70">alice@example.com</span>
                    </div>
                </div>`;
        expect(renderUser(user)).toStrictEqual(result);
    });
});


describe('getMembers', () => {
    it('when project id is invalid getMembers resolves to empty array (mocked)', async () => {
    // The spy makes selectByValue return [] for the default/global id.
    vi.spyOn(main, 'selectByValue').mockResolvedValueOnce([]);
    await expect(getMembers()).resolves.toStrictEqual([]);
    });

    it('returns project members for valid project id', async () => {
        // Arrange: make selectByValue return a single member row, and selectById return the user
        vi.spyOn(main, 'selectByValue').mockResolvedValueOnce([{ user_id: 1, role: 'member' }]);
        vi.spyOn(main, 'selectById').mockResolvedValueOnce({ id: '1', user_name: 'dev_alice', pw_hash: { type: 'Buffer', data: [] }, email: 'alice@example.com', created_at: '2026-02-25T07:23:39.098Z' });

        const result = await getMembers();

        // Assert: getMembers returns [{ user: <user object>, role }]
        expect(result).toEqual([
            { user: { id: '1', user_name: 'dev_alice', pw_hash: { type: 'Buffer', data: [] }, email: 'alice@example.com', created_at: '2026-02-25T07:23:39.098Z' }, role: 'member' },
        ]);
    });
});


describe('getJoinRequests', () => {
    it("null returns empty array", async () => {
        await expect(getJoinRequests()).resolves.toStrictEqual([]);
    });

    it('returns requests for valid project id', async () => {
        vi.spyOn(main, 'selectByValue').mockResolvedValueOnce([{ user_id: 1, role: 'requester' }]);

        const result = await getJoinRequests();

        expect(result).toEqual([
            { user: { id: '1', user_name: 'dev_alice', pw_hash: { type: 'Buffer', data: [] }, email: 'alice@example.com', created_at: '2026-02-25T07:23:39.098Z' }, role: 'requester', user_id: 1 },
        ]);
    })
})
// describe('renderUser', () => {
//     it("null returns undefined", () => {
        
//     })
// })