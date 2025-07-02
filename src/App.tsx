import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Sun, Moon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global Dark/Light Mode Toggle */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Toggle
          aria-label="Toggle dark mode"
          onClick={() => {
            const html = document.documentElement;
            html.classList.toggle('dark');
          }}
          className="h-10 w-10 flex items-center justify-center border border-input bg-background hover:bg-muted transition-colors"
        >
          {document.documentElement.classList.contains('dark') ? (
            <Sun className="h-6 w-6 text-primary" />
          ) : (
            <Moon className="h-6 w-6 text-primary" />
          )}
        </Toggle>
      </div>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
