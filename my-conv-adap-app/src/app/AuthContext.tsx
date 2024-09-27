import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebaseConfig"; // Assuming you're using Firebase for authentication
import { signInWithEmailAndPassword } from "firebase/auth";

interface User {
  uid: string;
  email: string | null;
  // Add any other user properties you need
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Add any other auth-related functions you need
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          // Set any other user properties you need
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return auth.signOut();
  };

  const wrappedSignIn = async (
    email: string,
    password: string
  ): Promise<void> => {
    await signIn(email, password);
  };

  const adjustedValue: AuthContextType = {
    user,
    loading,
    signIn: wrappedSignIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={adjustedValue}>
      {children}
    </AuthContext.Provider>
  );
};
