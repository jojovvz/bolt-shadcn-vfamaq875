import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { LessonDialog } from './lesson-dialog';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type Module = Database['public']['Tables']['modules']['Row'];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedModule]);

  async function fetchData() {
    try {
      const [lessonsResponse, modulesResponse] = await Promise.all([
        supabase
          .from('lessons')
          .select('*, module:modules(title)')
          .eq(selectedModule !== 'all' ? 'module_id' : '', selectedModule)
          .order('module_id')
          .order('order_index'),
        supabase
          .from('modules')
          .select('*')
          .order('title')
      ]);

      if (lessonsResponse.error) throw lessonsResponse.error;
      if (modulesResponse.error) throw modulesResponse.error;

      setLessons(lessonsResponse.data || []);
      setModules(modulesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson(id: string) {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Aula excluída com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Erro ao excluir aula');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Aulas</h3>
          <p className="text-muted-foreground">Gerencie as aulas dos módulos</p>
        </div>
        <Button onClick={() => {
          setSelectedLesson(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-[200px]">
          <Select
            value={selectedModule}
            onValueChange={setSelectedModule}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os módulos</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Módulo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>{(lesson.module as any)?.title || 'Sem módulo'}</TableCell>
                <TableCell>{lesson.order_index}</TableCell>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {lesson.description}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/modules/${lesson.module_id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLesson(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
        modules={modules}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}