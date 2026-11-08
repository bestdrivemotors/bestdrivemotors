import AdminFrame from './components/AdminFrame';

export const metadata = {
  title: { default: 'Admin', template: '%s | Best Drive Motors' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminFrame>{children}</AdminFrame>;
}