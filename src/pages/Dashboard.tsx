import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Module = Database['public']['Tables']['modules']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function Dashboard() {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      console.log('Starting data fetch...');
      console.log('User:', user);
      
      if (!user) {
        console.log('No user, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        // First, fetch categories
        console.log('Fetching categories...');
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('id');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          return;
        }

        // If no categories found, create default ones
        if (!categoriesData || categoriesData.length === 0) {
          console.log('No categories found, using default categories');
          const defaultCategories = [
            { id: 1, name: 'Introdução', description: 'Módulos introdutórios' },
            { id: 2, name: 'Redes Sociais', description: 'Marketing em redes sociais' },
            { id: 3, name: 'Tráfego Pago', description: 'Estratégias de tráfego pago' },
            { id: 4, name: 'Produtos', description: 'Produtos disponíveis' },
            { id: 5, name: 'Criação de Conteúdo', description: 'Criação de conteúdo e design' },
            { id: 6, name: 'Branding', description: 'Desenvolvimento de marca' }
          ];
          setCategories(defaultCategories);
          console.log('Set default categories:', defaultCategories);
        } else {
          setCategories(categoriesData);
          console.log('Categories fetched:', categoriesData);
        }

        // Then fetch modules
        console.log('Fetching modules...');
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('status', 'published')
          .order('order_index');

        if (modulesError) {
          console.error('Error fetching modules:', modulesError);
          return;
        }

        if (modulesData && modulesData.length > 0) {
          console.log('Modules fetched:', modulesData);
          setModules(modulesData);
        } else {
          console.log('No modules found');
        }

      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
        console.log('Data fetch complete');
      }
    }

    fetchData();
  }, [user]);

  // Debug logs for render cycle
  console.log('Current state:', {
    loading,
    modulesCount: modules.length,
    categoriesCount: categories.length,
    categories: categories,
    user: !!user
  });

  if (!user) {
    console.log('Rendering login prompt');
    return (
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to LessonPortal</h1>
        <p className="text-muted-foreground">Please log in to view the available modules.</p>
        <Link to="/login">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Log In
          </button>
        </Link>
      </div>
    );
  }

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group modules by category
  console.log('Grouping modules by category...');
  const modulesByCategory = categories.reduce((acc, category) => {
    const categoryModules = modules.filter(
      (module) => module.category_id === category.id
    );
    console.log(`Category ${category.id} (${category.name}) has ${categoryModules.length} modules`);
    if (categoryModules.length > 0) {
      acc[category.id] = categoryModules;
    }
    return acc;
  }, {} as Record<number, Module[]>);

  if (Object.keys(modulesByCategory).length === 0) {
    console.log('No modules available');
    return (
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">No Modules Available</h1>
        <p className="text-muted-foreground">Check back later for new content.</p>
      </div>
    );
  }

  console.log('Rendering modules grid');
  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryModules = modulesByCategory[category.id];
        if (!categoryModules) return null;

        return (
          <div key={category.id} className="space-y-4">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryModules.map((module) => (
                <Link key={module.id} to={`/modules/${module.id}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    {module.cover_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={module.cover_url}
                          alt={module.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`Error loading image for module ${module.id}:`, e);
                            e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {module.description || 'No description available'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}