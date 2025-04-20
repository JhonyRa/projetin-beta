import { AdminUsersTable } from "@/components/admin-users-table";

export default function ManageUserRolesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage User Roles</h1>
      <AdminUsersTable />
    </div>
  );
}
