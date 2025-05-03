import { DataProvider, fetchUtils } from "react-admin";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;
const apiUrl = "http://localhost:8000";
const httpClient = fetchUtils.fetchJson;

// 💡 Loose type to avoid TS errors on dynamic access
const endpoints: Record<
  string,
  Record<string, string | ((id: string | number) => string)>
> = {
  books: {
    list: "v1/books/all",
    create: "v1/books/add",
    getOne: (id) => `v1/books/${id}`,
    update: (id) => `v1/books/${id}`,
    delete: (id) => `v1/books/${id}`,
  },
  user: {
    list: "v1/user",
    create: "v1/user",
    getOne: (id) => `v1/user/${id}`,
    update: (id) => `v1/user/${id}`,
    delete: (id) => `v1/user/${id}`,
  },
  testPrompts: {
    list: "v1/testPrompts/all",
    create: "v1/testPrompts/add",
    getOne: (id) => `v1/testPrompts/${id}`,
    update: (id) => `v1/testPrompts/${id}`,
    delete: (id) => `v1/testPrompts/${id}`,
  },
  prompts: {
    list: "v1/prompts/all",
    create: "v1/prompts",
    getOne: (id) => `v1/prompts/${id}`,
    update: (id) => `v1/prompts/${id}`,
    delete: (id) => `v1/prompts/${id}`,
  },
  languages: {
    list: "v1/languages/all",
    create: "v1/languages",
    getOne: (id) => `v1/languages/${id}`,
    update: (id) => `v1/languages/${id}`,
    delete: (id) => `v1/languages/${id}`,
  },
};

const resolveEndpoint = (
  resource: string,
  action: string,
  id?: string | number
): string => {
  const resourceEndpoints = endpoints[resource];
  if (!resourceEndpoints) return `v1/${resource}`;
  const endpoint = resourceEndpoints[action];
  if (typeof endpoint === "function") return endpoint(id!);
  return endpoint;
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const sort = params.sort || { field: "id", order: "ASC" };
    const filter = params.filter || {};

    const query = {
      filter: JSON.stringify(filter),
      sort: JSON.stringify([sort.field, sort.order]),
    };

    const url = `${apiUrl}/${resolveEndpoint(resource, "list")}?${fetchUtils.queryParameters(query)}`;
    const { json } = await httpClient(url);
    return { data: json, total: json.length };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resolveEndpoint(resource, "getOne", params.id)}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/${resolveEndpoint(resource, "create")}`;
    const { json } = await httpClient(url, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resolveEndpoint(resource, "update", params.id)}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/${resolveEndpoint(resource, "delete", params.id)}`;
    const { json } = await httpClient(url, {
      method: "DELETE",
    });
    return { data: json };
  },

  getMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resolveEndpoint(resource, "list")}?${fetchUtils.queryParameters(query)}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const filter = {
      ...params.filter,
      [params.target]: params.id,
    };
    const query = {
      filter: JSON.stringify(filter),
      sort: JSON.stringify(["id", "ASC"]),
    };
    const url = `${apiUrl}/${resolveEndpoint(resource, "list")}?${fetchUtils.queryParameters(query)}`;
    const { json } = await httpClient(url);
    return { data: json, total: json.length };
  },

  updateMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resolveEndpoint(resource, "update", id)}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: responses.map(({ json }) => json.id) };
  },

  deleteMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resolveEndpoint(resource, "delete", id)}`, {
          method: "DELETE",
        })
      )
    );
    return { data: responses.map(({ json }) => json.id) };
  },
};
