import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ConnectedClients from "@/pages/ConnectedClients";
import Login from "@/pages/Login";
import Mcp from "@/pages/Mcp";
import McpConsent from "@/pages/McpConsent";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/connected-clients"} component={ConnectedClients} />
      <Route
        path={"/settings/connected-clients"}
        component={ConnectedClients}
      />
      <Route path={"/mcp/oauth/consent"} component={McpConsent} />
      <Route path={"/mcp"} component={Mcp} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
