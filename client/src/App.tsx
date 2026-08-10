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
import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SiteMetadata from "./seo/SiteMetadata";
import SpaNavigation from "./navigation/SpaNavigation";

const HomeFrameworkPreview = lazy(() => import("@/pages/HomeFrameworkPreview"));
const Journal = lazy(() => import("@/pages/Journal"));
const JournalArticle = lazy(() => import("@/pages/JournalArticle"));
const ProductJournal = lazy(() => import("@/pages/ProductJournal"));

export const privacyPolicyPaths = ["/privacy", "/privacy-policy"] as const;

function ProductJournalRoute() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f8faff]" />}>
      <ProductJournal />
    </Suspense>
  );
}

function JournalRoute() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#fafcff]" />}>
      <Journal />
    </Suspense>
  );
}

function JournalArticleRoute({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#fafcff]" />}>
      <JournalArticle slug={slug} />
    </Suspense>
  );
}

function HomeFrameworkPreviewRoute() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#fbfcff]" />}>
      <HomeFrameworkPreview />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={HomeFrameworkPreviewRoute} />
      <Route
        path={"/framework-preview"}
        component={HomeFrameworkPreviewRoute}
      />
      <Route path={"/ios"}>
        <Redirect to="/#waitlist" replace />
      </Route>
      <Route path={"/agent-memory"}>
        <Redirect to="/#book" replace />
      </Route>
      <Route path={"/how-it-works"}>
        <Redirect to="/#product" replace />
      </Route>
      <Route path={"/journal/:slug"}>
        {params => <JournalArticleRoute slug={params.slug} />}
      </Route>
      <Route path={"/journal"} component={JournalRoute} />
      <Route path={"/product-journal"} component={ProductJournalRoute} />
      <Route path={"/use-cases/:slug"}>
        <Redirect to="/#use-cases" replace />
      </Route>
      <Route path={"/user-cases"}>
        <Redirect to="/#use-cases" replace />
      </Route>
      <Route path={"/bay-area-agent-demo-2"}>
        <Redirect to="/" replace />
      </Route>
      <Route path={"/login"} component={Login} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/connected-clients"} component={ConnectedClients} />
      {privacyPolicyPaths.map(path => (
        <Route key={path} path={path} component={PrivacyPolicyPage} />
      ))}
      <Route path={"/terms"} component={TermsOfServicePage} />
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
