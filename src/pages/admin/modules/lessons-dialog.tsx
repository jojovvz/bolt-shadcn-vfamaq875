import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { LessonDialog } from './lesson-dialog';

type Module = Database['public']['Tables']['modules']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

interface SortableRowProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
}

function SortableRow({ lesson, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-50')}
    >
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell>{lesson.order_index}</TableCell>
      <TableCell className="font-medium">{lesson.title}</TableCell>
      <TableCell className="max-w-[300px] truncate">
        {lesson.description}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(lesson)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lesson.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface LessonsDialogProps {
  module: Module | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonsDialog({
  module,
  open,
  onOpenChange,
}: LessonsDialogProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (module) {
      fetchLessons();
    }
  }, [module]);

  async function fetchLessons() {
    if (!module) return;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Erro ao carregar aulas');
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
      
      // After deleting, reorder remaining lessons
      const remainingLessons = lessons.filter(l => l.id !== id);
      const updates = remainingLessons.map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        module_id: lesson.module_id,
        youtube_url: lesson.youtube_url,
        order_index: index + 1,
      }));

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('lessons')
          .upsert(updates);

        if (updateError) throw updateError;
      }

      toast.success('Aula excluída com sucesso');
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Erro ao excluir aula');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);

    const updatedLessons = [...lessons];
    const [movedLesson] = updatedLessons.splice(oldIndex, 1);
    updatedLessons.splice(newIndex, 0, movedLesson);

    // Update order_index for all lessons
    const updates = updatedLessons.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      module_id: lesson.module_id,
      youtube_url: lesson.youtube_url,
      order_index: index + 1,
    }));

    try {
      const { error } = await supabase
        .from('lessons')
        .upsert(updates);

      if (error) throw error;

      setLessons(updatedLessons);
      toast.success('Ordem atualizada com sucesso');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar ordem');
      fetchLessons(); // Revert to original order
    }
  }

  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Aulas do Módulo: {module.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              setSelectedLesson(null);
              setLessonDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </div>

          <div className="border rounded-lg">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={lessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {lessons.map((lesson) => (
                      <SortableRow
                        key={lesson.id}
                        lesson={lesson}
                        onEdit={(lesson) => {
                          setSelectedLesson(lesson);
                          setLessonDialogOpen(true);
                        }}
                        onDelete={deleteLesson}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>

        <LessonDialog
          open={lessonDialogOpen}
          onOpenChange={setLessonDialogOpen}
          lesson={selectedLesson}
          module={module}
          onSuccess={fetchLessons}
        />
      </DialogContent>
    </Dialog>
  );
}
