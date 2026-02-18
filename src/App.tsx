import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConciergeWidget from "@/components/ConciergeWidget";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<><Index /><Footer /></>} />
          <Route path="/about" element={<><About /><Footer /></>} />
          <Route path="/services" element={<><Services /><Footer /></>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<><Contact /><Footer /></>} />
          <Route path="/pricing" element={<><Pricing /><Footer /></>} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ConciergeWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
