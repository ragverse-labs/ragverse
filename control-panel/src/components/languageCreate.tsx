import { Create, SimpleForm, TextInput } from "react-admin";

export const LanguageCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="code" />
      <TextInput source="source_script" />
      <TextInput source="target_script" />
    </SimpleForm>
  </Create>
);
