import { supabase } from '@/lib/supabase';
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createContext({ req, res }: CreateNextContextOptions) {
  const token = req.headers.authorization?.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);

  return {
    supabase,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
