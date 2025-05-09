import { Conversation } from '@/types/chat';
import { FolderInterface } from '@/types/folder';
import { Prompt, PromptSchema } from '@/types/prompt';
import { Settings } from '@/types/settings';

import { MONGODB_DB } from '../app/const';

import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { User, UserRole } from '@/types/user';
import { UserLlmUsage, NewUserLlmUsage, LlmPriceRate } from '@/types/llmUsage';
import { OpenAIModelID } from '@/types/openai';

// import { Buffer } from 'buffer';
// import { readFile } from 'fs/promises';
import { TestPrompt } from '@/types/test-prompt';

let _db: Db | null = null;
export async function getDb(): Promise<Db> {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  if (_db !== null) {
    return _db;
  }

  const client = new MongoClient(process.env.MONGODB_URI, { monitorCommands: true });
 const MAX_RETRIES = 5;
 const RETRY_DELAY_MS = 5000;
 let retries = 0;

 while (retries < MAX_RETRIES) {
   try {
     console.log("Attempting to connect to MongoDB, try: " + (retries + 1));
     await client.connect();
     console.log("Successfully connected to MongoDB");

     let db = client.db(MONGODB_DB);
     _db = db;
     return db;
   } catch (error) {
     retries++;
     console.error(`Failed to connect to MongoDB (attempt ${retries}/${MAX_RETRIES}):`);

     if (retries >= MAX_RETRIES) {
       throw new Error(`Unable to connect to MongoDB after ${MAX_RETRIES} attempts`);
     }

     console.log(`Retrying to connect in ${RETRY_DELAY_MS / 1000} seconds...`);
     await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
   }
 }

 throw new Error("Failed to connect to MongoDB after maximum retries");

}

export interface ConversationCollectionItem {
  userId: string;
  conversation: Conversation;
}
export interface PromptsCollectionItem {
  userId: string;
  prompt: Prompt;
}

export interface FoldersCollectionItem {
  userId: string;
  folder: FolderInterface;
}

export interface PublicFoldersCollectionItem {
  folder: FolderInterface;
}

export interface SettingsCollectionItem {
  settings: Settings;
}

export interface TestPromptCollectionItem {
  testPrompt: TestPrompt;
}

export class UserDb {
  private _conversations: Collection<ConversationCollectionItem>;
  private _folders: Collection<FoldersCollectionItem>;
  private _prompts: Collection<PromptsCollectionItem>;
  private _publicPrompts: Collection<PromptsCollectionItem>;
  private _settings: Collection<SettingsCollectionItem>;
  private _llmUsage: Collection<UserLlmUsage>;
  private _users: Collection<User>;

  constructor(_db: Db, private _userId: string) {
    this._conversations =
      _db.collection<ConversationCollectionItem>('conversations');
    this._folders = _db.collection<FoldersCollectionItem>('folders');
    this._prompts = _db.collection<PromptsCollectionItem>('prompts');
    this._publicPrompts = _db.collection<PromptsCollectionItem>('publicPrompts');
    this._settings = _db.collection<SettingsCollectionItem>('settings');
    this._llmUsage = _db.collection<UserLlmUsage>('userLlmUsage');
    this._users = _db.collection<User>('user');
  }


  static async fromUserHash(userId: string, db?: Db): Promise<UserDb> {
    if (!db) db = await getDb()
    return new UserDb(db, userId);
  }

  async getCurrenUser(): Promise<User> {
    return (await this._users.findOne({ id: this._userId }))!;
  }

  async getConversations(): Promise<Conversation[]> {
    return (
      await this._conversations
        .find({ userId: this._userId })
        .sort({ _id: -1 })
        .toArray()
    ).map((item) => item.conversation);
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const conversation = await this._conversations.findOne({ "conversation.id": id });
    return conversation ? conversation.conversation : null;
  }
  

  async saveConversation(conversation: Conversation) {
    return this._conversations.updateOne(
      { userId: this._userId, 'conversation.id': conversation.id },
      { $set: { conversation } },
      { upsert: true },
    );
  }

  async saveConversations(conversations: Conversation[]) {
    for (const conversation of conversations) {
      await this.saveConversation(conversation);
    }
  }
  removeConversation(id: string) {
    this._conversations.deleteOne({
      userId: this._userId,
      'conversation.id': id,
    });
  }

  removeAllConversations() {
    this._conversations.deleteMany({ userId: this._userId });
  }

  async getFolders(): Promise<FolderInterface[]> {
    const items = await this._folders
      .find({ userId: this._userId })
      .sort({ 'folder.name': 1 })
      .toArray();
    return items.map((item) => item.folder);
  }

  async saveFolder(folder: FolderInterface) {
    return this._folders.updateOne(
      { userId: this._userId, 'folder.id': folder.id },
      { $set: { folder } },
      { upsert: true },
    );
  }

  async saveFolders(folders: FolderInterface[]) {
    for (const folder of folders) {
      await this.saveFolder(folder);
    }
  }

  async removeFolder(id: string) {
    return this._folders.deleteOne({
      userId: this._userId,
      'folder.id': id,
    });
  }

  async removeAllFolders(type: string) {
    return this._folders.deleteMany({
      userId: this._userId,
      'folder.type': type,
    });
  }

  async getPrompts(): Promise<Prompt[]> {
    const items = await this._prompts
      .find({ userId: this._userId })
      .sort({ 'prompt.name': 1 })
      .toArray();
    return items.map((item) => item.prompt);
  }



  async savePrompt(prompt: Prompt) {
    return this._prompts.updateOne(
      { userId: this._userId, 'prompt.id': prompt.id },
      { $set: { prompt: { ...prompt, userId: this._userId } } },
      { upsert: true },
    );
  }

  async savePrompts(prompts: Prompt[]) {
    for (const prompt of prompts) {
      await this.savePrompt(prompt);
    }
  }

  async removePrompt(id: string) {
    return this._prompts.deleteOne({
      userId: this._userId,
      'prompt.id': id,
    });
  }

  async getSettings(): Promise<Settings> {
    const item = await this._settings.findOne({ userId: this._userId });
    // const userName =  (await this.getCurrenUser()).name;
    
    const userName =  "OV";
    if (item) {
      return item.settings;
    }
    return {
      userId: this._userId,
      displayName: userName!,
      theme: 'dark',
      defaultBook: 'bhagvad-gita',
      defaultLanguage: 'eng_Latn',
      sourceLanguage: 'eng_Latn',
      defaultTemperature: 1.0,
      // avatar: this._defaultAvatar
    };
  }



  async saveSettings(settings: Settings) {
  
    settings.userId = this._userId;
    return this._settings.updateOne(
      { userId: this._userId },
      { $set: { settings } },
      { upsert: true },
    );
  }

  async publishPrompt(prompt: Prompt) {
    return this._publicPrompts.insertOne(
      {
        prompt: { ...prompt, userId: this._userId },
        userId: this._userId
      });
  }

  async getLlmUsageBetweenDates(start: Date, end: Date): Promise<UserLlmUsage[]> {
    return (await this._llmUsage.find({
      userId: this._userId,
      date: {
        $gt: start,
        $lt: end,
      }
    }).toArray());
  }

  async addLlmUsage(llmApiUsage: NewUserLlmUsage) {
    return this._llmUsage.insertOne({ ...llmApiUsage, userId: this._userId });
  }

}

export class PublicPromptsDb {
  private _publicPrompts: Collection<PromptsCollectionItem>;
  private _publicFolders: Collection<PublicFoldersCollectionItem>;
  private _testPrompts: Collection<TestPromptCollectionItem>;

  constructor(_db: Db) {
    this._testPrompts = _db.collection<TestPromptCollectionItem>('test_prompts');
    this._publicPrompts = _db.collection<PromptsCollectionItem>('publicPrompts');
    this._publicFolders = _db.collection<PublicFoldersCollectionItem>('publicFolders');
    
  }

  async getFolders(): Promise<FolderInterface[]> {
    const items = await this._publicFolders
      .find()
      .sort({ 'folder.name': 1 })
      .toArray();
    return items.map((item) => item.folder);
  }

  async getTestPrompts(): Promise<TestPrompt[]> {
    const items = await this._testPrompts
      .find()
      .toArray();
    return items as unknown as TestPrompt[];
  }


  async saveFolder(folder: FolderInterface) {
    return this._publicFolders.updateOne(
      { 'folder.id': folder.id },
      { $set: { folder } },
      { upsert: true },
    );
  }

  async removeFolder(id: string) {
    await this._publicPrompts.updateMany(
      { 'prompt.folderId': id },
      { $set: { "prompt.folderId": null } },
      { upsert: false }
    )
    return this._publicFolders.deleteOne({
      'folder.id': id,
    });
  }

  async getPrompts(): Promise<Prompt[]> {
    const items = await this._publicPrompts
      .find()
      .sort({ 'prompt.name': 1 })
      .toArray();
    return items.map((item) => item.prompt);
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    const item = await this._publicPrompts
      .findOne({ 'prompt.id': id });
    return item?.prompt;
  }

  async savePrompt(prompt: Prompt) {
    return this._publicPrompts.updateOne(
      { 'prompt.id': prompt.id },
      { $set: { prompt, userId: prompt.userId } },
      { upsert: true },
    );
  }

  async removePrompt(id: string) {
    return this._publicPrompts.deleteOne({
      'prompt.id': id,
    });
  }
 
}

export class UserInfoDb {
  private _users: Collection<User>;

  constructor(_db: Db) {
    this._users = _db.collection<User>('user');
  }

  async getUser(id: string): Promise<User | null> {
    return await this._users.findOne({
      id: id
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this._users.findOne({
      email: email
    });
  }

  async getUsers(): Promise<User[]> {
    return (await this._users.find().toArray());
  }

  async addUser(user: User) {
    return await this._users.insertOne(user);
  }

  async saveUser(user: User) {
    return await this._users.updateOne(
      { email: user.email },
      { $set: { ...user } },
      { upsert: true },
    )
  }

  async saveUsers(users: User[]) {
    for (const user of users) {
      await this.saveUser(user);
    }
  }

  async removeUser(id: string) {
    return await this._users.deleteOne({ id: id });
  }

}

export class LlmsDb {
  private _llmPriceRate: Collection<LlmPriceRate>;

  constructor(_db: Db) {
    this._llmPriceRate = _db.collection<LlmPriceRate>('llmPriceRate');
  }

  async getModelPriceRate(id: OpenAIModelID): Promise<LlmPriceRate | null> {
    return await this._llmPriceRate.findOne({ modelId: id });
  }
}
