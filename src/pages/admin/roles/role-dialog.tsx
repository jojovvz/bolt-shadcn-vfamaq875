import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const roleSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  permissions: z.array(z.string()).min(1, 'Selecione pelo menos uma permissão'),
});

type RoleForm = z.infer<typeof roleSchema>;

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
};

interface RoleDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const availablePermissions = [
  { id: 'view_dashboard', label: 'Visualizar Dashboard' },
  { id: 'manage_users', label: 'Gerenciar Usuários' },
  { id: 'manage_roles', label: 'Gerenciar Funções' },
  { id: 'manage_content', label: 'Gerenciar Conteúdo' },
  { id: 'view_reports', label: 'Visualizar Relatórios' },
  { id: 'manage_settings', label: 'Gerenciar Configurações' },
];

export function RoleDialog({
  role,
  open,
  onOpenChange,
  onSuccess,
}: RoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!role;

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || [],
    },
  });

  async function onSubmit(data: RoleForm) {
    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('roles')
          .update(data)
          .eq('id', role.id);

        if (error) throw error;
        toast.success('Função atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('roles')
          .insert([data]);

        if (error) throw error;
        toast.success('Função criada com sucesso');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Erro ao salvar função');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Função' : 'Nova Função'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite os detalhes e permissões da função'
              : 'Crie uma nova função definindo suas permissões'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da função" {...field} />
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
                      placeholder="Descrição da função"
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Permissões</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {availablePermissions.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, permission.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {permission.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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