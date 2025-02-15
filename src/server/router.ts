import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createContext } from './context';
import { TRPCError } from '@trpc/server';

const t = initTRPC.context<typeof createContext>().create();

const router = t.router;
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next();
});

const appRouter = router({
  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }

      return data;
    }),

  getModules: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('modules')
      .select('*');

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return data;
  }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('categories')
      .select('*');

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return data;
  }),

  getLessons: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('lessons')
      .select('*');

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return data;
  }),
});

export type AppRouter = typeof appRouter;
export default appRouter;
