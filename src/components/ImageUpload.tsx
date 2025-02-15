import { ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isValidImageType, isValidFileSize, uploadImage } from '@/lib/upload';
import { ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  bucket: string;
  path: string;
  className?: string;
}

export function ImageUpload({ onUpload, bucket, path, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidImageType(file)) {
      toast.error('Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP.');
      return;
    }

    if (!isValidFileSize(file, 5)) {
      toast.error('Arquivo muito grande. Máximo de 5MB.');
      return;
    }

    const url = await uploadImage(file, bucket, path);
    if (url) {
      onUpload(url);
      toast.success('Imagem enviada com sucesso');
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Enviar imagem
      </Button>
    </div>
  );
}