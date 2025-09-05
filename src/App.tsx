import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Auth from "./pages/Auth";
import Categories from "./pages/Categories";
import Services from "./pages/Services";
import Users from "./pages/Users";
import Receipts from "./pages/Receipts";
import Reports from "./pages/Reports";
import InvoiceDetails from "./pages/InvoiceDetails";
import QuotationDetails from "./pages/QuotationDetails";
import NotFound from "./pages/NotFound";

const App = () => (
  <DataProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/products" element={<Products />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/services" element={<Services />} />
          <Route path="/users" element={<Users />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/invoice/:id" element={<InvoiceDetails />} />
          <Route path="/quotation/:id" element={<QuotationDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </DataProvider>
);

export default App;
