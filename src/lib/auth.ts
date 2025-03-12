// src/lib/auth.ts
export const login = (username: string, password: string): boolean => {
    // This is a simple example. In production, use proper authentication with a backend
    const validUsername = "admin";
    const validPassword = "password123";

    if (username === validUsername && password === validPassword) {
      localStorage.setItem("isAuthenticated", "true");
      return true;
    }
    return false;
  };

  export const logout = () => {
    localStorage.removeItem("isAuthenticated");
  };

  export const isAuthenticated = (): boolean => {
    return localStorage.getItem("isAuthenticated") === "true";
  };