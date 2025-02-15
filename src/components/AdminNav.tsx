import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, FileText, FolderOpen, Home, Shield, Users } from 'lucide-react';

const items = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Categorias',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    title: 'Módulos',
    href: '/admin/modules',
    icon: BookOpen,
  },
  {
    title: 'Aulas',
    href: '/admin/lessons',
    icon: FileText,
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Funções',
    href: '/admin/roles',
    icon: Shield,
  },
];

export default function AdminNav() {
  const location = useLocation();

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              location.pathname === item.href && 'bg-accent'
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}