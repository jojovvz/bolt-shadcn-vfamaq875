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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';
import ReactPlayer from 'react-player';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type Module = Database['public']['Tables']['modules']['Row'];

const lessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  module_id: z.number().min(1, 'Selecione um módulo'),
  youtube_url: z.string().url('URL inválida'),
  order_index: z.number().min(0),
});

type LessonForm = z.infer<typeof lessonSchema>;

interface LessonDialogProps {
  lesson: Lesson | null;
  modules: Module[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LessonDialog({
  lesson,
  modules,
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
      module_id: undefined,
      youtube_url: '',
      order_index: 0,
    },
  });

  // Reset form when lesson changes
  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        description: lesson.description || '',
        module_id: lesson.module_id || undefined,
        youtube_url: lesson.youtube_url,
        order_index: lesson.order_index,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        module_id: undefined,
        youtube_url: '',
        order_index: 0,
      });
    }
  }, [lesson, form]);

  async function onSubmit(data: LessonForm) {
    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('lessons')
          .update(data)
          .eq('id', lesson.id);

        if (error) throw error;
        toast.success('Aula atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert([data]);

        if (error) throw error;
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
            <div className="grid grid-cols-2 gap-4">
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
                name="module_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um módulo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem
                            key={module.id}
                            value={module.id.toString()}
                          >
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        min="0"
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