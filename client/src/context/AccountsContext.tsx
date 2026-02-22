import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { fetchAllEmailAccounts } from "../services/emailService";
import { useAuth } from "./AuthContext";

// Account interface
export interface Account {
  _id: string;
  email: string;
  provider: string;
  isActive: boolean;
  notificationsEnabled: boolean;
  syncStatus: string;
  lastSyncedDate: string;
  initialSyncCompleted: boolean;
}

// Context type
interface AccountsContextType {
  accounts: Account[];
  isLoading: boolean;
  refetch: () => void;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

// Create context
const AccountsContext = createContext<AccountsContextType | null>(null);

// Provider component
export const AccountsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load accounts from API
  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllEmailAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setAccounts([]); // fallback to empty list on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load accounts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadAccounts();
    } else if (!isAuthenticated) {
      setAccounts([]);
    }
  }, [isAuthenticated, authLoading]);

  // Memoize context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      accounts,
      isLoading,
      refetch: loadAccounts,
      setAccounts,
    }),
    [accounts, isLoading],
  );

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};

// Custom hook to use accounts context
export const useAccounts = (): AccountsContextType => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountsProvider");
  }
  return context;
};
