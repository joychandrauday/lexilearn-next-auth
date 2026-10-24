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
    async jwt({ token, account, profile, trigger, session }) {
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

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
  },

  // CRITICAL: Global error handler (use logger.error instead of unsupported events.error)
  events: {
    async signIn({ account, profile, user, isNewUser }) {
      console.log("✅ SignIn Success:", { account, isNewUser })
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