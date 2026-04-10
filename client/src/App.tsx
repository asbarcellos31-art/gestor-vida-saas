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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/gestao-tempo" component={GestaoTempo} />
      <Route path="/orcamento/dashboard" component={OrcamentoDashboard} />
      <Route path="/orcamento/:year/:month">
        {(params) => <MonthlyBudget key={`${params.year}-${params.month}`} />}
      </Route>
      <Route path="/orcamento" component={MonthlyBudget} />
      <Route path="/parcelados" component={Installments} />
      <Route path="/aposentadoria" component={Retirement} />
      <Route path="/planos" component={Planos} />
      <Route path="/trial-expirado" component={TrialExpired} />
      <Route path="/aprender" component={Aprender} />
      <Route path="/admin" component={Admin} />
      <Route path="/assinatura/sucesso" component={AssinaturaSucesso} />
      <Route path="/orcamento/configuracoes" component={OrcamentoSettings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
