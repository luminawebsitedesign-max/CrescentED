import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Intake from "./pages/Intake";
import Dashboard from "./pages/Dashboard";
import ModuleView from "./pages/ModuleView";
import Modules from "./pages/Modules";
import Tools from "./pages/Tools";
import PDFs from "./pages/PDFs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/auth" element={<Auth mode="login" />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/module/:id" element={<ModuleView />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/pdfs" element={<PDFs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
