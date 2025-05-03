import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { TestPromptCreate } from "./components/testPromptCreate";
import { BookCreate } from "./components/bookCreate";
import { LanguageCreate } from "./components/languageCreate";
import { PromptCreate } from "./components/promptCreate";
import BookIcon from "@mui/icons-material/MenuBook";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import QuizIcon from "@mui/icons-material/Quiz";
import LanguageIcon from "@mui/icons-material/Language";
import GroupIcon from "@mui/icons-material/Group";

export const App = () => (
  <Admin
    layout={Layout}
    dataProvider={dataProvider}
    authProvider={authProvider}
  >
 <Resource
  name="books"
  icon={BookIcon}
  list={ListGuesser}
  edit={EditGuesser}
  show={ShowGuesser}
  create={BookCreate}
/>
<Resource
  name="testPrompts"
  icon={QuestionAnswerIcon}
  list={ListGuesser}
  edit={EditGuesser}
  show={ShowGuesser}
  create={TestPromptCreate}
/>
<Resource
  name="prompts"
  icon={QuizIcon}
  list={ListGuesser}
  edit={EditGuesser}
  show={ShowGuesser}
  create={PromptCreate}
/>
<Resource
  name="languages"
  icon={LanguageIcon}
  list={ListGuesser}
  edit={EditGuesser}
  show={ShowGuesser}
  create={LanguageCreate}
/>
<Resource
  name="users"
  icon={GroupIcon}
  list={ListGuesser}
  edit={EditGuesser}
  show={ShowGuesser}
/>

  </Admin>
);
