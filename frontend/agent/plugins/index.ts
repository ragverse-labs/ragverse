import { Plugin } from '@/types/agent';

import { TaskExecutionContext } from './executor';
import {
  RequestsGetTool,
  RequestsGetWebpageTool,
  RequestsPostTool,
  RequestsPostWebpageTool,
} from './requests';

export const createApiTools = (context: TaskExecutionContext): Plugin[] => {
  return [new RequestsGetTool(), new RequestsPostTool()];
};

export const createWebpageTools = (context: TaskExecutionContext): Plugin[] => {
  return [new RequestsGetWebpageTool(), new RequestsPostWebpageTool()];
};
