import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/types/supabase';
import { CheckCircle2, Circle, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Module = Database['public']['Tables']['modules']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type UserProgress = Database['public']['Tables']['user_progress']['Row'];

export default function ModuleView() {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!moduleId) {
        setError('Módulo não encontrado');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching module:', moduleId);
        
        // Fetch module
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('*')
          .eq('id', parseInt(moduleId))
          .single();

        if (moduleError) {
          console.error('Module fetch error:', moduleError);
          setError('Erro ao carregar o módulo');
          return;
        }

        if (!moduleData) {
          setError('Módulo não encontrado');
          return;
        }

        setModule(moduleData);
        console.log('Module loaded:', moduleData);

        // Fetch lessons
        console.log('Fetching lessons for module:', moduleId);
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', parseInt(moduleId))
          .order('order_index');

        if (lessonsError) {
          console.error('Lessons fetch error:', lessonsError);
          setError('Erro ao carregar as aulas');
          return;
        }

        console.log('Lessons loaded:', lessonsData);
        
        if (lessonsData && lessonsData.length > 0) {
          setLessons(lessonsData);
          setCurrentLesson(lessonsData[0]);

          // Fetch progress if user is logged in
          if (user) {
            console.log('Fetching progress for user:', user.id);
            const { data: progressData, error: progressError } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id)
              .in('lesson_id', lessonsData.map(l => l.id));

            if (progressError) {
              console.error('Progress fetch error:', progressError);
              toast.error('Erro ao carregar progresso');
            } else {
              console.log('Progress loaded:', progressData);
              setProgress(progressData || []);
            }
          }
        } else {
          console.log('No lessons found');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('Ocorreu um erro inesperado');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [moduleId, user]);

  const markAsComplete = async (lessonId: string) => {
    if (!user) {
      toast.error('Faça login para acompanhar seu progresso');
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          id: crypto.randomUUID(),
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: now,
          created_at: now,
          updated_at: now,
        });

      if (error) throw error;

      setProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => p.lesson_id === lessonId ? { ...p, completed: true, completed_at: now } : p);
        }
        return [...prev, {
          id: crypto.randomUUID(),
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: now,
          created_at: now,
          updated_at: now,
        }];
      });

      toast.success('Aula marcada como concluída!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Erro ao atualizar progresso');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="aspect-video w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-destructive">Erro</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Módulo não encontrado</h2>
        <p className="text-muted-foreground mt-2">O módulo solicitado não está disponível.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Main content */}
      <div className="md:col-span-3 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{module.title}</h1>
          <p className="text-muted-foreground mt-2">{module.description}</p>
        </div>

        {currentLesson && (
          <>
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={currentLesson.youtube_url}
                width="100%"
                height="100%"
                controls
                playing
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{currentLesson.title}</h2>
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                </div>
                {user && (
                  <Button
                    onClick={() => markAsComplete(currentLesson.id)}
                    disabled={progress.some(p => p.lesson_id === currentLesson.id && p.completed)}
                  >
                    {progress.some(p => p.lesson_id === currentLesson.id && p.completed)
                      ? 'Aula concluída'
                      : 'Marcar como concluída'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lessons list */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Aulas ({lessons.length})</h3>
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const isCompleted = progress.some(
              (p) => p.lesson_id === lesson.id && p.completed
            );
            const isActive = currentLesson?.id === lesson.id;

            return (
              <Card
                key={lesson.id}
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer",
                  isActive && "border-primary"
                )}
                onClick={() => setCurrentLesson(lesson)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : isActive ? (
                        <Play className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base leading-tight">
                        {lesson.title}
                      </CardTitle>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}