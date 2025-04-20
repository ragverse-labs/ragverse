import { Message } from './chat';
import { OpenAIModel } from './openai';

import { TaskExecutionContext } from '@/agent/plugins/executor';

export type Action = {
  type: 'action';
  thought: string;
  plugin: PluginSummary;
  pluginInput: string;
};
export type Answer = {
  type: 'answer';
  answer: string;
};
export type ReactAgentResult = Action | Answer;

export interface PlanningResponse {
  taskId: string;
  result: ReactAgentResult;
}

export interface PluginResult {
  action: Action;
  result: string;
}

export interface PlanningRequest {
  taskId?: string;
  model: OpenAIModel;
  messages: Message[];
  enabledToolNames: string[];
  pluginResults: PluginResult[];
}

export interface RunPluginRequest {
  taskId: string;
  model: OpenAIModel;
  input: string;
  action: Action;
}

export interface ToolDefinitionApi {
  type: string;
  url: string;
  hasUserAuthentication: boolean;
}

export interface ToolAuth {
  type: string;
}
export interface Plugin {
  nameForHuman: string;
  nameForModel: string;
  descriptionForModel: string;
  descriptionForHuman: string;
  execute?: (context: TaskExecutionContext, action: Action) => Promise<string>;
  api?: ToolDefinitionApi;
  apiSpec?: string;
  auth?: ToolAuth;
  books?: Books;
  logoUrl?: string;
  contactEmail?: string;
  legalInfoUrl?: string;
  displayForUser: boolean;
}

 export interface Book {
  identifier: string;
  name: string;
  category: string;
  ranking: number;
  author: string;
  description: string;
  reviewedBy: string;
  status: string;
  created: number;
  ownedBy: string;
}

export interface Books {
  [key: string]: Book;
}

export interface RemotePluginTool extends Plugin {
  api: ToolDefinitionApi;
  apiSpec: string;

  auth: ToolAuth;
}

export interface PluginSummary {
  nameForHuman: string;
  nameForModel: string;
  descriptionForModel: string;
  descriptionForHuman: string;
  displayForUser: boolean;
  logoUrl?: string;
}
