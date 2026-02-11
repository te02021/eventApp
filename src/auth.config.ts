import { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isOnRegister = path.startsWith("/register");
      const isOnLogin = path.startsWith("/login");
      if (isOnRegister || isOnLogin) {
        return true;
      }
      if (isLoggedIn) {
        return true;
      }

      return false;
    },
  },
};
