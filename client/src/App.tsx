import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import GestaoTempo from "./pages/GestaoTempo";
import MonthlyBudget from "./pages/MonthlyBudget";
import Installments from "./pages/Installments";
import Retirement from "./pages/Retirement";
import OrcamentoDashboard from "./pages/OrcamentoDashboard";
import Planos from "./pages/Planos";
import TrialExpired from "./pages/TrialExpired";
import Aprender from "./pages/Aprender";
import Admin from "./pages/Admin";
import AssinaturaSucesso from "./pages/AssinaturaSucesso";
import OrcamentoSettings from "./pages/OrcamentoSettings";
import Ferramentas from "./pages/Ferramentas";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import VideoPlayer from "./pages/VideoPlayer";
import TutorialCompleto from "./pages/TutorialCompleto";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import LGPDPage from "./pages/LGPDPage";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const HOTMART_URL = "https://pay.hotmart.com/M105784997J?checkoutMode=2";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const { data: subscription, isLoading: subLoading } = trpc.subscription.get.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (loading || subLoading) return null;

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const plan = (subscription as any)?.plan;
  const isAdmin = (subscription as any)?.isAdmin;

  if (!plan && !isAdmin) {
    window.location.href = HOTMART_URL;
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/login" component={Login} />
      <Route path="/esqueci-senha" component={EsqueciSenha} />
      <Route path="/redefinir-senha" component={RedefinirSenha} />
      <Route path="/politica-de-privacidade" component={PrivacyPolicy} />
      <Route path="/termos-de-uso" component={TermsOfUse} />
      <Route path="/lgpd" component={LGPDPage} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/gestao-tempo">{() => <ProtectedRoute component={GestaoTempo} />}</Route>
      <Route path="/orcamento/dashboard">{() => <ProtectedRoute component={OrcamentoDashboard} />}</Route>
      <Route path="/orcamento/:year/:month">
        {(params) => <ProtectedRoute component={() => <MonthlyBudget key={`${params.year}-${params.month}`} />} />}
      </Route>
      <Route path="/orcamento">{() => <ProtectedRoute component={MonthlyBudget} />}</Route>
      <Route path="/parcelados">{() => <ProtectedRoute component={Installments} />}</Route>
      <Route path="/aposentadoria">{() => <ProtectedRoute component={Retirement} />}</Route>
      <Route path="/planos" component={Planos} />
      <Route path="/trial-expirado" component={TrialExpired} />
      <Route path="/aprender">{() => <ProtectedRoute component={Aprender} />}</Route>
      <Route path="/ferramentas">{() => <ProtectedRoute component={Ferramentas} />}</Route>
      <Route path="/tutorial-completo">{() => <ProtectedRoute component={TutorialCompleto} />}</Route>
      <Route path="/tutorial/:id">
        {(params: { id?: string }) => <ProtectedRoute component={() => <VideoPlayer id={params.id ?? ""} />} />}
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/assinatura/sucesso" component={AssinaturaSucesso} />
      <Route path="/orcamento/configuracoes">{() => <ProtectedRoute component={OrcamentoSettings} />}</Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
