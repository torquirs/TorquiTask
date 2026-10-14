import { z } from 'zod';
import { createTRPCRouter } from '../init';
import { projectRouter } from './project.router';
 
export const appRouter = createTRPCRouter({
  project: projectRouter,

});
 
// export type definition of API
export type AppRouter = typeof appRouter;