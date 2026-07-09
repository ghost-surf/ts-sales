import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Sales from "./pages/Sales";
import Auth from "./pages/Auth";
import Categories from "./pages/Categories";
import ServiceCategories from "./pages/ServiceCategories";
import Services from "./pages/Services";
import Users from "./pages/Users";
import Receipts from "./pages/Receipts";
import Reports from "./pages/Reports";
import TaxesPage from "./pages/TaxesPage";
import Settings from "./pages/Settings";
import StockMovements from "./pages/StockMovements";
import Invoices from "./pages/Invoices";
import Quotations from "./pages/Quotations";
import InvoiceDetails from "./pages/InvoiceDetails";
import QuotationDetails from "./pages/QuotationDetails";
import ReceiptDetails from "./pages/ReceiptDetails";
import CreditNotes from "./pages/CreditNotes";
import CreditNoteDetails from "./pages/CreditNoteDetails";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <DataProvider>
        <ConfirmProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route
              path="/categories"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-categories"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ServiceCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path="/taxes"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <TaxesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
            <Route path="/receipt/:id" element={<ProtectedRoute><ReceiptDetails /></ProtectedRoute>} />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-movements"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <StockMovements />
                </ProtectedRoute>
              }
            />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
            <Route path="/quotation/:id" element={<ProtectedRoute><QuotationDetails /></ProtectedRoute>} />
            <Route path="/credit-notes" element={<ProtectedRoute><CreditNotes /></ProtectedRoute>} />
            <Route path="/credit-note/:id" element={<ProtectedRoute><CreditNoteDetails /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
        </ConfirmProvider>
      </DataProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
