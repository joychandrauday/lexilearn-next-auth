import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDb } from "./db";
import UserProfile from "./models/UserProfile";
import SubscriberLead from "./models/SubscriberLead";
import { verifyPassword } from "./password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          await connectDb();
          const cleanEmail = (credentials.email as string).toLowerCase().trim();
          const user = await UserProfile.findOne({ email: cleanEmail });
          if (!user || !user.passwordHash) return null;

          const isValid = verifyPassword(credentials.password as string, user.passwordHash);
          if (!isValid) return null;

          // Update lastActiveAt
          user.lastActiveAt = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name || cleanEmail.split("@")[0],
            email: user.email,
            image: user.image || "",
            role: user.role || "STUDENT",
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }: any) {
      if (user) {
        token.id = user.id || token.sub;
        token.role = user.role || "STUDENT";
        token.name = user.name || profile?.name || token.name;
        token.email = user.email || profile?.email || token.email;
        token.picture = user.image || profile?.picture || token.picture;
      }

      if (trigger === "update" && session) {
        token.name = session.user?.name || token.name;
        token.email = session.user?.email || token.email;
        token.picture = session.user?.image || token.picture;
        token.role = session.user?.role || token.role;
        return token;
      }

      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id || token.sub;
        session.user.role = token.role || "STUDENT";
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },

  events: {
    async signIn({ account, profile, user, isNewUser }: any) {
      if (user?.email) {
        try {
          await connectDb();
          const cleanEmail = user.email.toLowerCase().trim();
          const fullName = user.name || profile?.name || cleanEmail.split("@")[0];
          const avatar = user.image || profile?.picture || "";

          await UserProfile.findOneAndUpdate(
            { email: cleanEmail },
            {
              $set: {
                name: fullName,
                image: avatar,
                lastActiveAt: new Date(),
              },
              $setOnInsert: {
                role: "STUDENT",
                targetExam: "বিসিএস প্রিলিমিনারি (BCS)",
                preparationStage: "প্রিলিমিনারি",
                dailyGoal: 20,
                bio: "লক্ষ্য: বিসিএস ও প্রথম শ্রেণির সরকারি চাকরি",
                streakCount: 0,
                legacySynced: false,
              },
            },
            { upsert: true, new: true }
          );

          await SubscriberLead.findOneAndUpdate(
            { email: cleanEmail },
            {
              $set: {
                source: account?.provider ? `${account.provider} OAuth Login` : "Login",
              },
            },
            { upsert: true }
          );
        } catch (e) {
          console.error("Error auto-syncing UserProfile on login:", e);
        }
      }
    },
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});
