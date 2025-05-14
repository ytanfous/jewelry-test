import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from '@/lib/prisma';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials, req) => {
                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                });

                if (user && await compare(credentials.password, user.password)) {
                    // Get IP address from the request headers
                    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

                    // Update last sign-in time and log IP address in connection history
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastSignIn: new Date() },
                    });

                    await prisma.connectionhistory.create({
                        data: {
                            userId: user.id,
                            loginTime: new Date(),
                            ipAddress: ipAddress, // Save IP address here
                        },
                    });

                    return { id: user.id, username: user.username, type: user.type };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
        maxAge: 3600,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.type = user.type;
            }

            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.username = token.username;
            session.user.type = token.type;
            return session;
        },
    },
    jwt: {
        maxAge: 3600,
    },
};

export default NextAuth(authOptions);
