import { Separator } from '@/components/ui/separator';
import AdminNav from './AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Painel Administrativo</h2>
        <p className="text-muted-foreground">
          Gerencie categorias, módulos, aulas e usuários.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <AdminNav />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}