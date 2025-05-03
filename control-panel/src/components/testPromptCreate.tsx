import { Create, SimpleForm, TextInput, NumberInput } from "react-admin";

export const TestPromptCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="question" fullWidth />
      <TextInput source="answer" fullWidth />
      <TextInput source="language" />
      <TextInput source="book_name" />
      <NumberInput source="order" />
      <NumberInput source="show" defaultValue={1} />
    </SimpleForm>
  </Create>
);
