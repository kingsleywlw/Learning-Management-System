import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'
import UserSections from "../../../components/admin/UserSections";
import { useGetUserOffRole } from '@/hooks/useGetUserOffRole';
// Dummy data
const dummyCourses = ["Math 101", "History 201", "Science 301", "Art 401"];

export default async function AdminPage() {
  // Get current user using server-side auth
  const { userId } = await auth();
  const client = await clerkClient();
  
  // Get current user details
  const currentUser = userId ? await client.users.getUser(userId) : null;
  const currentUserFullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin User";

  const rawUsers = (await client.users.getUserList()).data;
  
  // Serialize users to plain objects
  const users = rawUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress,
      role: user.publicMetadata.role || 'student'
  }));


  return (
    <div className="flex min-h-screen">
      {/* Sidebar is assumed to be fixed at w-64, so add margin-left */}
      <div className="flex-1 flex justify-center items-start" style={{ marginLeft: '16rem' }}>
        <div className="p-6 max-w-2xl w-full mt-4">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <div className="mb-4">
            <span className="font-semibold">Welcome, </span>
            <span className="text-blue-700 font-semibold">{currentUserFullName}</span>
          </div>
          <UserSections allUsers={users} />
        </div>
      </div>
    </div>
  );
}