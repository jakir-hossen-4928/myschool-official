import { Client, Databases, ID, Query, Account } from "appwrite";

// Load environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const IMAGE_HOST_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const TEACHERS_COLLECTION_ID = import.meta.env.VITE_TEACHERS_COLLECTION_ID;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);

export {
    client,
    databases,
    account,
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID,
    IMAGE_HOST_KEY, TEACHERS_COLLECTION_ID
};





// Updated login function
export const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Ensure we're using the correct method name (createEmailPasswordSession for newer versions)
      await account.createEmailPasswordSession(email, password); // Updated method name
      localStorage.setItem("isAuthenticated", "true");
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  export const logout = async (): Promise<void> => {
    try {
      await account.deleteSession('current');
      localStorage.removeItem("isAuthenticated");
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  export const isAuthenticated = async (): Promise<boolean> => {
    try {
      await account.get();
      localStorage.setItem("isAuthenticated", "true");
      return true;
    } catch (error) {
      localStorage.removeItem("isAuthenticated");
      return false;
    }
  };
  export const resetPassword = async (email: string, resetUrl: string): Promise<void> => {
    try {
      await account.createRecovery(email, resetUrl);
      console.log("Password recovery email sent successfully");
    } catch (error) {
      console.error("Error initiating password recovery:", error);
      throw error;
    }
  };
