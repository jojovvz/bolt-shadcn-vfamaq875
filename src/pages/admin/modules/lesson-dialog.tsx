import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';
import ReactPlayer from 'react-player';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type Module = Database['public']['Tables']['modules']['Row'];

const lessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  youtube_url: z.string().url('URL inválida'),
  order_index: z.number().min(1, 'Ordem deve ser maior que 0'),
});

type LessonForm = z.infer<typeof lessonSchema>;

interface LessonDialogProps {
  lesson: Lesson | null;
  module: Module;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LessonDialog({
  lesson,
  module,
  open,
  onOpenChange,
  onSuccess,
}: LessonDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!lesson;

  const form = useForm<LessonForm>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      description: '',
      youtube_url: '',
      order_index: 1,
    },
  });

  useEffect(() => {
    async function getNextOrderIndex() {
      if (!isEditing) {
        try {
          const { data, error } = await supabase
            .from('lessons')
            .select('order_index')
            .eq('module_id', module.id)
            .order('order_index', { ascending: false })
            .limit(1);

          if (error) throw error;

          const nextIndex = data && data.length > 0 ? data[0].order_index + 1 : 1;
          form.setValue('order_index', nextIndex);
        } catch (error) {
          console.error('Error getting next order index:', error);
          form.setValue('order_index', 1);
        }
      }
    }

    if (lesson) {
      form.reset({
        title: lesson.title,
        description: lesson.description || '',
        youtube_url: lesson.youtube_url,
        order_index: lesson.order_index,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        youtube_url: '',
        order_index: 1,
      });
      getNextOrderIndex();
    }
  }, [lesson, module.id, form, isEditing]);

  async function onSubmit(data: LessonForm) {
    setLoading(true);
    try {
      // Get all lessons for this module
      const { data: existingLessons, error: fetchError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index');

      if (fetchError) throw fetchError;

      const lessons = existingLessons || [];
      const targetIndex = data.order_index - 1; // Convert to 0-based index

      if (isEditing) {
        // Remove the current lesson from the array
        const currentIndex = lessons.findIndex(l => l.id === lesson.id);
        lessons.splice(currentIndex, 1);
      }

      // Insert the lesson at the target position
      const newLesson = isEditing ? { ...lesson, ...data } : {
        ...data,
        module_id: module.id,
      };

      // Ensure target index is within bounds
      const insertIndex = Math.min(Math.max(targetIndex, 0), lessons.length);
      lessons.splice(insertIndex, 0, newLesson as Lesson);

      // Update all order indexes
      const updates = lessons.map((l, index) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        module_id: l.module_id,
        youtube_url: l.youtube_url,
        order_index: index + 1, // Convert back to 1-based index
      }));

      if (isEditing) {
        // Update all lessons at once
        const { error: updateError } = await supabase
          .from('lessons')
          .upsert(updates);

        if (updateError) throw updateError;
        toast.success('Aula atualizada com sucesso');
      } else {
        // First insert the new lesson
        const { error: insertError } = await supabase
          .from('lessons')
          .insert([{
            ...data,
            module_id: module.id,
          }]);

        if (insertError) throw insertError;

        // Then update the order of all lessons
        const { error: updateError } = await supabase
          .from('lessons')
          .upsert(updates.filter(u => u.id !== undefined));

        if (updateError) throw updateError;
        toast.success('Aula criada com sucesso');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Erro ao salvar aula');
    } finally {
      setLoading(false);
    }
  }

  const youtubeUrl = form.watch('youtube_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Aula' : 'Nova Aula'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da aula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da aula"
                      className="h-32"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do YouTube</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_index"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {youtubeUrl && (
              <div className="aspect-video w-full">
                <ReactPlayer
                  url={youtubeUrl}
                  width="100%"
                  height="100%"
                  controls
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={loading}>
                {isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}