import { Create, SimpleForm, TextInput } from "react-admin";

export const PromptCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="identifier" />
      <TextInput source="name" />
      <TextInput source="type" />
      <TextInput source="system_prompt" fullWidth />
      <TextInput source="system_prompt_sfx" fullWidth />
      <TextInput source="user_prompt" fullWidth />
      <TextInput source="user_prompt_prx" fullWidth />
    </SimpleForm>
  </Create>
);
