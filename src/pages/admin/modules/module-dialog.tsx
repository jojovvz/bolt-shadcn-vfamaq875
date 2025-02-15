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
import { ImageUpload } from '@/components/ImageUpload';

type Module = Database['public']['Tables']['modules']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const moduleSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  category_id: z.number().min(1, 'Selecione uma categoria'),
  order_index: z.number().min(0),
  cover_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

type ModuleForm = z.infer<typeof moduleSchema>;

interface ModuleDialogProps {
  module: Module | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ModuleDialog({
  module,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: ModuleDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!module;

  const form = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: undefined,
      order_index: 0,
      cover_url: '',
      status: 'draft',
    },
  });

  // Reset form when module changes
  useEffect(() => {
    if (module) {
      form.reset({
        title: module.title,
        description: module.description || '',
        category_id: module.category_id || undefined,
        order_index: module.order_index,
        cover_url: module.cover_url || '',
        status: (module.status as 'draft' | 'published' | 'archived') || 'draft',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        category_id: undefined,
        order_index: 0,
        cover_url: '',
        status: 'draft',
      });
    }
  }, [module, form]);

  async function onSubmit(data: ModuleForm) {
    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('modules')
          .update(data)
          .eq('id', module.id);

        if (error) throw error;
        toast.success('Módulo atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('modules')
          .insert([data]);

        if (error) throw error;
        toast.success('Módulo criado com sucesso');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Erro ao salvar módulo');
    } finally {
      setLoading(false);
    }
  }

  const handleCoverUpload = (url: string) => {
    form.setValue('cover_url', url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Módulo' : 'Novo Módulo'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {form.watch('cover_url') && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={form.watch('cover_url')}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <ImageUpload
                onUpload={handleCoverUpload}
                bucket="covers"
                path={`module-${module?.id || 'new'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do módulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
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
                      placeholder="Descrição do módulo"
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
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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