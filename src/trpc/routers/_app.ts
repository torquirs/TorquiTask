
import { createTRPCRouter } from '../init';
import { projectRouter } from './project.router';
import { taskRouter } from './task-router';
import { workflowStatusRouter } from './workflow.router';
 
export const appRouter = createTRPCRouter({
  project: projectRouter,
  task: taskRouter,
  workflow: workflowStatusRouter,

});
 
// export type definition of API
export type AppRouter = typeof appRouter;