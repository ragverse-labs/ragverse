import { Action, Book, Plugin, RemotePluginTool } from '@/types/agent';

import { createApiTools, createWebpageTools } from '.';
import { TaskExecutionContext } from './executor';

import { OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_ORGANIZATION } from '@/utils/app/const';

// interface PluginsJson {
//   internals: string[];
//   urls: string[];
// }

// const internalPlugins = {
//   // [wikipedia.nameForModel]: wikipedia,
//   // [google.nameForModel]: google,
//   // [python.nameForModel]: python,
// };

function snakeToCamel(obj: Record<string, any>) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const camelObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
    camelObj[camelKey] = snakeToCamel(obj[key]);
  });

  return camelObj;
}

// const loadFromUrl = async (url: string): Promise<Plugin> => {
//   // console.log("its insde 2");
//   // console.log(url);
//   // let url2 = "http://backend/api/v1/chat/vedas_plugins"
//   let url2 = `${OPENAI_API_HOST}/chat/vedas_plugins`;
//   // const res = await fetch(url);
//   const res = await fetch(url2, {
// //    mode: 'cors',  // Enable CORS
//     headers: {
//       'Content-Type': 'application/json',
//       // ...(OPENAI_API_TYPE === 'openai' && {
//       //   Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
//       // }),
//       // ...(OPENAI_API_TYPE === 'azure' && {
//       //   'api-key': `${key ? key : process.env.OPENAI_API_KEY}`,
//       // }),
//       // ...(OPENAI_API_TYPE === 'openai' &&
//       //   OPENAI_ORGANIZATION && {
//       //     'OpenAI-Organization': OPENAI_ORGANIZATION,
//       //   }),
//     },
//   });
//   if (!res.ok) {
//     throw new Error(
//       `Failed to fetch plugin from ${url2} with status ${res.status}`,
//     );
//   }

  // const plugin = snakeToCamel(await res.json()) as RemotePluginTool;
  // // const plugin = await res.json() as Plugin;
  // // console.log("is this ie");
  // // console.log(plugin);
  
//   const apiSpecRes = await fetch(plugin.api.url);

//   if (!apiSpecRes.ok) {
//     throw new Error(
//       `Failed to fetch API spec from ${plugin.api.url} with status ${apiSpecRes.status}`,
//     );
//   }
//   const apiUrlJson = (await apiSpecRes.text()).trim();
//   // console.log(apiUrlJson);
//   const apiSpec = `Usage Guide: ${plugin.descriptionForModel}\n\nOpenAPI Spec: ${apiUrlJson}`;
//   return {
//     ...plugin,
//     // override description for model.
//     descriptionForModel: `Call this tool to get the OpenAPI spec (and usage guide)
//   for interacting with the ${plugin.nameForModel} API.
//   You should only call this ONCE! What is the "${plugin.nameForModel} API useful for?"
//   ${plugin.descriptionForHuman}`,
//     apiSpec,
//     displayForUser: true,
//     execute: async (ctx: TaskExecutionContext, action: Action) => apiSpec,
//   };
// };

let cache: Plugin[] | null = null;
// list plugins without private plugins.
export const listTools = async (): Promise<Plugin[]> => {
  // if (cache !== null) {
  //   return cache;
  // }

  const result: Plugin[] = [];
  
  try {

    let url = `${OPENAI_API_HOST}/books/all/`;
    // let url = 'http://backend:8000/v1/books/all/';
    // console.log("url found is...." + url);
    // const tool = await loadFromUrl(url);
    const response = await fetch(url, {
      // mode: 'cors',  // Enable CORS
      headers: {
        'Content-Type': 'application/json'
      }
    });
   const res: Book[] = await response.json();
  // console.log(res);
    
    for (const  book of Object.values(res)) {
      let tl: Plugin = {
        nameForHuman: book.name,
        nameForModel: book.identifier,
        descriptionForModel: book.description,
        descriptionForHuman: book.description,
        displayForUser: false,

      }
      result.push(tl);
    }
  } catch (e) {
    console.warn(`Failed to load plugin from .`, e);
  }
  // console.log(result);
  cache = result;
  return result;
};

// list all plugins including private plugins.
export const listAllTools = async (
  context: TaskExecutionContext,
): Promise<Plugin[]> => {
  const apiTools = createApiTools(context);
  const webTools = createWebpageTools(context);
  const availableTools = await listTools();

  return [...apiTools, ...webTools, ...availableTools];
};
// list plugins based on specified plugins
export const listToolsBySpecifiedPlugins = async (
  context: TaskExecutionContext,
  pluginNames: string[],
): Promise<Plugin[]> => {
  let result: Plugin[] = [];
  const plugins = (await listTools()).filter((p) =>
    pluginNames.includes(p.nameForModel),
  );
  if (plugins.some((p) => p.api)) {
    result = [...result, ...createApiTools(context)];
  }
  if (plugins.some((p) => !p.api)) {
    result = [...result, ...createWebpageTools(context)];
  }
  return [...result, ...plugins];
};
