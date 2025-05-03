import { Create, SimpleForm, TextInput, NumberInput } from "react-admin";

export const BookCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="identifier" fullWidth />
      <TextInput source="name" fullWidth />
      <TextInput source="category" />
      <TextInput source="author" />
      <TextInput source="description" fullWidth />
      <NumberInput source="ranking" />
      <TextInput source="reviewed_by" />
      <TextInput source="status" />
      <TextInput source="owned_by" />
      <NumberInput source="created" defaultValue={Math.floor(Date.now() / 1000)} />
    </SimpleForm>
  </Create>
);
