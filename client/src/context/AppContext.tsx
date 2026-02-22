import { AccountsProvider } from "./AccountsContext";
import { AuthProvider } from "./AuthContext";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <AccountsProvider>{children}</AccountsProvider>
    </AuthProvider>
  );
};
