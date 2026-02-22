import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./router/AppRouter";
import { AppProvider } from "./context/AppContext";

const client = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </QueryClientProvider>
  );
}
