import AdminLoginForm from '../components/AdminLoginForm';

export const metadata = { title: 'Admin sign in | Best Drive Motors' };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12">
      <AdminLoginForm />
    </main>
  );
}