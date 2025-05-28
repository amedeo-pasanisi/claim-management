
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/projects/Projects";
import ProjectForm from "./pages/projects/ProjectForm";
import ProjectDetail from "./pages/projects/ProjectDetail";
import Contractors from "./pages/contractors/Contractors";
import ContractorForm from "./pages/contractors/ContractorForm";
import ContractorDetail from "./pages/contractors/ContractorDetail";
import Claims from "./pages/claims/Claims";
import ClaimForm from "./pages/claims/ClaimForm";
import ClaimDetail from "./pages/claims/ClaimDetail";
import Countries from "./pages/countries/Countries";
import CountryForm from "./pages/countries/CountryForm";
import CountryDetail from "./pages/countries/CountryDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/edit" element={<ProjectForm />} />
              
              <Route path="contractors" element={<Contractors />} />
              <Route path="contractors/new" element={<ContractorForm />} />
              <Route path="contractors/:id" element={<ContractorDetail />} />
              <Route path="contractors/:id/edit" element={<ContractorForm />} />
              
              <Route path="claims" element={<Claims />} />
              <Route path="claims/new" element={<ClaimForm />} />
              <Route path="claims/:id" element={<ClaimDetail />} />
              <Route path="claims/:id/edit" element={<ClaimForm />} />

              <Route path="countries" element={<Countries />} />
              <Route path="countries/new" element={<CountryForm />} />
              <Route path="countries/:id" element={<CountryDetail />} />
              <Route path="countries/:id/edit" element={<CountryForm />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
