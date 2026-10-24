import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",

  // ERROR HANDLING - This catches ALL errors
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }: any) {
      if (user) {
        token.name = user.name || profile?.name || token.name
        token.email = user.email || profile?.email || token.email
        token.picture = user.image || profile?.picture || token.picture
      }

      if (trigger === "update" && session) {
        token.name = session.user?.name
        token.email = session.user?.email
        token.picture = session.user?.image
        return token
      }

      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
  },

  // Auto-sync UserProfile & Leads on login
  events: {
    async signIn({ account, profile, user, isNewUser }: any) {
      console.log("✅ Google SignIn Success:", { email: user?.email, name: user?.name, isNewUser })
      if (user?.email) {
        try {
          const { connectDb } = await import("../../../../lib/db");
          const UserProfile = (await import("../../../../lib/models/UserProfile")).default;
          const SubscriberLead = (await import("../../../../lib/models/SubscriberLead")).default;
          await connectDb();
          const cleanEmail = user.email.toLowerCase().trim();
          const fullName = user.name || profile?.name || cleanEmail.split('@')[0];
          const avatar = user.image || profile?.picture || '';

          await UserProfile.findOneAndUpdate(
            { email: cleanEmail },
            {
              $set: {
                name: fullName,
                image: avatar,
              },
              $setOnInsert: {
                targetExam: 'বিসিএস প্রিলিমিনারি (BCS)',
                preparationStage: 'প্রিলিমিনারি',
                dailyGoal: 20,
                bio: 'লক্ষ্য: বিসিএস ও প্রথম শ্রেণির সরকারি চাকরি',
              },
            },
            { upsert: true, new: true }
          );

          await SubscriberLead.findOneAndUpdate(
            { email: cleanEmail },
            {
              $set: {
                source: 'Google OAuth Login',
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

  // Use NextAuth logger to capture internal errors in a typed-safe way
  logger: {
    error(error: Error) {
      console.error("❌ Auth Error:", error);
      console.log(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!);
      // Log to your error service (Sentry, etc.)
      if (process.env.NODE_ENV === "production") {
        console.error("Auth Error Details:", JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
        }, null, 2));
      }
    },
    warn(code) {
      console.warn(code)
    },
    debug(code) {
      if (process.env.NODE_ENV === "development") console.debug(code)
    },
  },

  // Handle provider errors
  pages: {
    error: "/auth/error", // Custom error page
  },
})

export const { GET, POST } = handlers