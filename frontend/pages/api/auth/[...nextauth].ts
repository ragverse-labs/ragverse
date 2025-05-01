import NextAuth, { CallbacksOptions, NextAuthOptions, PagesOptions, Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { UserInfoDb, getDb } from '@/utils/server/storage';
import { User, UserRole } from '@/types/user';
import { getUserHashFromMail } from '@/utils/server/auth';

import loggerFn from 'pino';
import { IUserProfile, IUserProfileCreate } from '@/lib/interfaces';
import { generateUUID, tokenParser } from '@/lib/utilities';
import { apiAuth } from '@/lib/api';


const logger = loggerFn({ name: 'auth' });

const providers = [];
if (process.env.NEXTAUTH_ENABLED === 'false' || process.env.NEXTAUTH_ENABLED === 'true' ) {
  providers.push(
    Credentials({
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials: any, req: any) {
        const email = credentials.email.trim();
        const id = getUserHashFromMail(email);
        return {
          id,
          email,
        };
      },
    }),
  );
}
if (process.env.GOOGLE_CLIENT_ID) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

let pages: Partial<PagesOptions> = {};

if (process.env.NEXTAUTH_ENABLED === 'true') {
  // pages['signIn'] = '/pages/autologin';
  pages['signIn'] = '/autologin';
  // pages['newUser'] = '/auth/new-user';

}

async function doSignIn(values: any): Promise<IUserProfile | null> {
  if (values.email) {
    try {
      const userInfoDb = await getUserDb();
      const existingUser = await userInfoDb.getUserByEmail(values.email);
      if (existingUser) {
        // console.log(values.password);
        if (values.password) {
          // Credentials login (email/password)
          const user = await apiAuth.authenticate(values.email, values.password);
          if (user) {
            const updatedUser: IUserProfile = {
              id: existingUser.id!,
              email: existingUser.email,
              password: false,
              email_validated: false,
              is_active: false,
              is_superuser: false,
              fullName: '',
              totp: false
            };
            return updatedUser;
          } else {
            return null; // Invalid credentials
          }
        } else {
          // Google login (no password)
          const updatedUser: IUserProfile = {
            id: existingUser.id!,
            email: existingUser.email,
            password: false,
            email_validated: true,  // Trust Google auth
            is_active: true,
            is_superuser: false,
            fullName: existingUser.name || '',
            totp: false
          };
          return updatedUser;
        }
      } else {
        // Create new user profile if not exist
        const newAccessToken = values.accessToken;
        const data: IUserProfileCreate = {
          email: values.email,
          password: values.password || generateUUID(), // Generate random if no password
          fullName: values.fullName ? values.fullName : "",
        };
        return await apiAuth.createUserProfile(newAccessToken, data);
      }
    } catch (error) {
      console.error("Error during user sign-in or creation:", error);
      return null;
    }
  }

  return null;
}




const callbacks: Partial<CallbacksOptions> = {
  async redirect({ url, baseUrl }) {
    // Allows relative callback URLs
    // console.log(url);
    // console.log(baseUrl);
    if (url.startsWith("/")) return `${baseUrl}${url}`
    // Allows callback URLs on the same origin
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl
  },
  // async redirect({ url, baseUrl }) {
  //   // Ensure that the user is redirected to the base URL without callbackUrl query parameters
  //   console.log(baseUrl);
  //   return baseUrl; 
  //   if (url === `${baseUrl}/` || url === baseUrl) {
  //     return baseUrl; // Redirect to the base URL without any query parameters
  //   }
  //   // if (url.startsWith(baseUrl)) {
      
  //     // If the URL starts with the base URL, redirect to the base URL without any query params
  //   //   return baseUrl;
  //   // }
  //   // Otherwise, return the original URL (in case of external URLs, etc.)
  //   return url;
  // },


  async signIn({ user, account, profile, email, credentials }) {
    console.log(credentials);
    console.log(account);
    console.log(profile);


    let usr;



    if (credentials) {
      // Credentials-based login (email/password)
      usr = await doSignIn({
        email: user.email,
        fullName: user.email!.substring(0, user.email!.indexOf('@')),
        password: credentials!.password,
        accessToken: credentials!.csrfToken,
      });
    } else if (user) {
      // Google-based login
      usr = await doSignIn({
        email: user.email,
        fullName: user.name || user.email!.substring(0, user.email!.indexOf('@')),
        // No password for Google login
        accessToken: account!.access_token || '', // optional, or use id_token
      });
    }

    
    // Handle the case where doSignIn returns null
    //  if (!usr) {
    //   console.error("Sign-in failed: User could not be signed in or created.");
    //   return false; // This will prevent the user from being signed in
    // }
    if (!usr) {
      let error = new Error("Invalid credentials or user creation failed.");
      console.error(error.message);
      return `/auth/autologin?error=${encodeURIComponent(error.message)}`;
    }
    // await updateOrCreateUser(user.email!, user.name || user.email!.substring(0, user.email!.indexOf('@')));
    await updateOrCreateUser(usr!);

    return true
  },
  async session({ session, token, user }) {
    // console.log(" session 4 ") ;
    session.user = await getUser(session);
    return session
  },
}

export const authOptions: NextAuthOptions = {
  providers: providers,
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.NEXTAUTH_SESSION_MAX_AGE || '86400'),
  },
  pages: {
    signIn: '/auth/autologin',
    // signUp: '/auth/signup',
  },
  callbacks: callbacks
};

async function getUserDb() {
  return new UserInfoDb(await getDb());
}

async function getUser(session: Session): Promise<User> {
  if (!session.user?.email) throw new Error("Unauthorized");
  const userId = getUserHashFromMail(session.user.email);
  return (await (await getUserDb()).getUser(userId))!;
}


async function updateOrCreateUser(usrProfile: IUserProfile): Promise<User> {
  const userInfoDb = await getUserDb();
  const userId = getUserHashFromMail(usrProfile.email);
  const updatedUser: User = {
    id: userId,
    email: usrProfile.email,
    name: usrProfile.fullName || usrProfile.email.substring(0, usrProfile.email.indexOf('@')),
    role: UserRole.USER, // Assuming UserRole includes 'admin' and 'user'
    // Optional fields like monthlyUSDConsumptionLimit can be added if needed
  };

  // Save the updated user object to the database
  await userInfoDb.saveUser(updatedUser);
  return updatedUser;
}


export default NextAuth(authOptions);



