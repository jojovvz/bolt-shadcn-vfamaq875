import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, FolderOpen, Users } from 'lucide-react';

type Stats = {
  categories: number;
  modules: number;
  lessons: number;
  users: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    categories: 0,
    modules: 0,
    lessons: 0,
    users: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: categoriesCount },
          { count: modulesCount },
          { count: lessonsCount },
          { count: usersCount },
        ] = await Promise.all([
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('modules').select('*', { count: 'exact', head: true }),
          supabase.from('lessons').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          categories: categoriesCount || 0,
          modules: modulesCount || 0,
          lessons: lessonsCount || 0,
          users: usersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie seu conteúdo e usuários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/categories">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/modules">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Módulos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.modules}</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/lessons">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lessons}</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
