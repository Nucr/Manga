import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Kullanıcı adı ve şifre gereklidir');
        }

        // Kullanıcıyı hem kullanıcı adı hem de e-postaya göre ara
        let user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          }
        });

        // Kullanıcı adı ile bulunamazsa e-posta ile dene
        if (!user && credentials.username?.includes('@')) { // @ işareti e-posta olduğunu düşündürür
             user = await prisma.user.findUnique({
                where: {
                    email: credentials.username // credentials.username aslında e-posta olabilir
                }
             });
        }

        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Geçersiz şifre');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
          profileImage: user.profileImage,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
        token.id = user.id;
        token.username = (user as any).username;
        token.profileImage = (user as any).profileImage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).profileImage = token.profileImage;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 