import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { z } from 'zod';
import { Progress } from '@/components/ui/progress';
import { Download, Upload } from 'lucide-react';

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['admin', 'member', 'support']).default('member'),
});

type UserImport = z.infer<typeof userSchema>;

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CsvImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: CsvImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = 'email,full_name,role\nexample@email.com,Full Name,member';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const users = results.data as UserImport[];
          const totalUsers = users.length;
          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < users.length; i++) {
            try {
              const user = userSchema.parse(users[i]);
              
              // Create auth user
              const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: Math.random().toString(36).slice(-8), // Random password
                email_confirm: true,
                user_metadata: {
                  full_name: user.full_name,
                  role: user.role,
                },
              });

              if (authError) throw authError;

              // Create profile
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                  id: authUser.user.id,
                  full_name: user.full_name,
                  role: user.role,
                }]);

              if (profileError) throw profileError;

              successCount++;
            } catch (error) {
              console.error(`Error importing user ${users[i].email}:`, error);
              errorCount++;
            }

            setProgress(((i + 1) / totalUsers) * 100);
          }

          if (successCount > 0) {
            toast.success(`${successCount} usuários importados com sucesso`);
            if (errorCount > 0) {
              toast.error(`${errorCount} usuários não puderam ser importados`);
            }
            onSuccess();
            onOpenChange(false);
          } else {
            toast.error('Nenhum usuário foi importado');
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
          toast.error('Erro ao processar arquivo CSV');
        } finally {
          setLoading(false);
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        console.error('Error reading CSV:', error);
        toast.error('Erro ao ler arquivo CSV');
        setLoading(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Usuários</DialogTitle>
          <DialogDescription>
            Importe usuários em massa usando um arquivo CSV.
            Baixe o template para ver o formato correto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo CSV
          </Button>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Importando usuários... {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}