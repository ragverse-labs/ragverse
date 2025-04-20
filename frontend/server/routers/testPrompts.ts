import { PublicPromptsDb, UserDb, getDb } from '@/utils/server/storage';
import { procedure, router } from '../trpc';


export const testPrompts = router({
    list: procedure.query(async ({ ctx }) => {
        const publicPromptsDb = new PublicPromptsDb(await getDb());
        let list = await publicPromptsDb.getTestPrompts();
        return list;
      }),

});

