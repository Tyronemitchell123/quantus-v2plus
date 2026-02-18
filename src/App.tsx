import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConciergeWidget from "@/components/ConciergeWidget";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /><Footer /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /><Footer /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /><Footer /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /><Footer /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /><Footer /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CursorGlow />
        <ScrollProgress />
        <Navbar />
        <AnimatedRoutes />
        <ConciergeWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
