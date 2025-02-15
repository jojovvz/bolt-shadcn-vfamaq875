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
import { Plus, Pencil, Trash2, Eye, GripVertical, List } from 'lucide-react';
import { toast } from 'sonner';
import { ModuleDialog } from './module-dialog';
import { LessonsDialog } from './lessons-dialog';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Module = Database['public']['Tables']['modules']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface SortableRowProps {
  module: Module;
  onEdit: (module: Module) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'draft' | 'published' | 'archived') => void;
  onViewLessons: (module: Module) => void;
}

function SortableRow({ module, onEdit, onDelete, onStatusChange, onViewLessons }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function getStatusColor(status: string | null) {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  }

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
      <TableCell>{module.order_index}</TableCell>
      <TableCell className="font-medium">{module.title}</TableCell>
      <TableCell>
        {module.cover_url && (
          <img
            src={module.cover_url}
            alt={module.title}
            className="w-20 h-12 object-cover rounded-md"
          />
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={getStatusColor(module.status)}>
          {module.status || 'draft'}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={module.status === 'published'}
          onCheckedChange={(checked) => {
            onStatusChange(module.id, checked ? 'published' : 'draft');
          }}
        />
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewLessons(module)}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gerenciar aulas</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/modules/${module.id}`} target="_blank">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualizar módulo</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(module)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar módulo</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(module.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir módulo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lessonsDialogOpen, setLessonsDialogOpen] = useState(false);

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
    fetchData();
  }, [selectedCategory]);

  async function fetchData() {
    try {
      const [modulesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('modules')
          .select('*, category:categories(name)')
          .eq(selectedCategory !== 'all' ? 'category_id' : '', selectedCategory)
          .order('order_index'),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (modulesResponse.error) throw modulesResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setModules(modulesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    }
  }

  async function deleteModule(id: number) {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Módulo excluído com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Erro ao excluir módulo');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    const updatedModules = [...modules];
    const [movedModule] = updatedModules.splice(oldIndex, 1);
    updatedModules.splice(newIndex, 0, movedModule);

    // Create updates preserving all required fields
    const updates = updatedModules.map((module, index) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      category_id: module.category_id,
      order_index: index + 1,
      cover_url: module.cover_url,
      status: module.status || 'draft',
    }));

    try {
      const { error } = await supabase
        .from('modules')
        .upsert(updates);

      if (error) throw error;

      setModules(updatedModules);
      toast.success('Ordem atualizada com sucesso');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar ordem');
      fetchData(); // Revert to original order
    }
  }

  async function handleStatusChange(id: number, status: 'draft' | 'published' | 'archived') {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  }

  function handleViewLessons(module: Module) {
    setSelectedModule(module);
    setLessonsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Módulos</h3>
          <p className="text-muted-foreground">Gerencie os módulos do curso</p>
        </div>
        <Button onClick={() => {
          setSelectedModule(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-[200px]">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                <TableHead>Capa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={modules.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                {modules.map((module) => (
                  <SortableRow
                    key={module.id}
                    module={module}
                    onEdit={(module) => {
                      setSelectedModule(module);
                      setDialogOpen(true);
                    }}
                    onDelete={deleteModule}
                    onStatusChange={handleStatusChange}
                    onViewLessons={handleViewLessons}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <ModuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        module={selectedModule}
        categories={categories}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
      />

      <LessonsDialog
        open={lessonsDialogOpen}
        onOpenChange={setLessonsDialogOpen}
        module={selectedModule}
      />
    </div>
  );
}
