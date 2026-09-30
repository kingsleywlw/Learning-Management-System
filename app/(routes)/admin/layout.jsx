import AdminSidebar from "../../../components/admin/AdminSidebar"

export default function AdminLayout({ children }) {
  return <section>
    <AdminSidebar />
    {children}
    </section>
}