import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
      profileImage?: string | null;
      role?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string | null;
    profileImage?: string | null;
    role?: string | null;
  }
} 