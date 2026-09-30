import { clerkClient } from '@clerk/nextjs/server';

/**
 * user with no role gets assigned student role
 * @param id Clerk user id
 */
export async function assignRole(id: string, role: string) {
    const client = await clerkClient();
	await client.users.updateUser(id, {
		publicMetadata: { role: role },
	});
}
