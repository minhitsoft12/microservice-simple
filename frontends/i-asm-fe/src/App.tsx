import "./App.css";
import { AuthProvider } from "@/context/AuthContext.tsx";
import AppRoutes from "@/routes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
