import { supabase } from './supabase';
import { toast } from 'sonner';

export async function uploadImage(file: File, bucket: string, path: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // First, check if there are any existing files in the path
    const { data: existingFiles } = await supabase.storage
      .from(bucket)
      .list(path);

    // If there are existing files, delete them
    if (existingFiles && existingFiles.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(existingFiles.map(file => `${path}/${file.name}`));

      if (deleteError) {
        console.error('Error deleting existing files:', deleteError);
      }
    }

    // Upload the new file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Erro ao fazer upload da imagem');
    return null;
  }
}

export function isValidImageType(file: File) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

export function isValidFileSize(file: File, maxSizeMB: number = 5) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  return file.size <= maxSize;
}