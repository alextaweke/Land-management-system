import RoleGuard from "../auth/RoleGuard";

const AdminPanel = () => {
  return (
    <RoleGuard role="admin">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p>Only admin users can view this page.</p>
      </div>
    </RoleGuard>
  );
};

export default AdminPanel;
