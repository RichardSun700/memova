import { Toaster } from "@/components/ui/sonner";
import AnalyticsTracker from "@/analytics/AnalyticsTracker";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ConnectedClients from "@/pages/ConnectedClients";
import { PrivacyPolicyPage, TermsOfServicePage } from "@/pages/LegalPage";
import Login from "@/pages/Login";
import Mcp from "@/pages/Mcp";
import McpConsent from "@/pages/McpConsent";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import UserCases from "@/pages/UserCases";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SiteMetadata from "./seo/SiteMetadata";
import SpaNavigation from "./navigation/SpaNavigation";
import AgentMemory from "./pages/AgentMemory";
import HowItWorks from "./pages/HowItWorks";
import IOS from "./pages/IOS";
import { UseCaseDetailPage } from "./pages/UseCaseDetail";

const BayAreaAgentDemo2 = lazy(() => import("@/pages/BayAreaAgentDemo2"));

export const privacyPolicyPaths = ["/privacy", "/privacy-policy"] as const;

function BayAreaAgentDemo2Route() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#fefcf6]" />}>
      <BayAreaAgentDemo2 />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/ios"} component={IOS} />
      <Route path={"/agent-memory"} component={AgentMemory} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/use-cases/:slug"}>
        {params => <UseCaseDetailPage slug={params.slug} />}
      </Route>
      <Route
        path={"/bay-area-agent-demo-2"}
        component={BayAreaAgentDemo2Route}
      />
      <Route path={"/login"} component={Login} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/connected-clients"} component={ConnectedClients} />
      {privacyPolicyPaths.map(path => (
        <Route key={path} path={path} component={PrivacyPolicyPage} />
      ))}
      <Route path={"/terms"} component={TermsOfServicePage} />
      <Route path={"/user-cases"} component={UserCases} />
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
            <SiteMetadata />
            <SpaNavigation />
            <AnalyticsTracker />
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
