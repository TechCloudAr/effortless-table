import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { MenuThemeProvider } from "@/contexts/MenuThemeContext";
import { MenuLayoutProvider } from "@/contexts/MenuLayoutContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import CustomerMenu from "./pages/CustomerMenu";
import OrderStatus from "./pages/OrderStatus";
import PaymentResult from "./pages/PaymentResult";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminSalesProfit from "./pages/AdminSalesProfit";
import AdminMenuIntelligence from "./pages/AdminMenuIntelligence";
import AdminTables from "./pages/AdminTables";
import AdminThemes from "./pages/AdminThemes";
import AdminPayments from "./pages/AdminPayments";
import AdminLayout from "./components/admin/AdminLayout";
import NotFound from "./pages/NotFound";
import CajaScreen from "./pages/CajaScreen";
import CocinaScreen from "./pages/CocinaScreen";
import MozoScreen from "./pages/MozoScreen";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminBranches from "./pages/AdminBranches";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BranchProvider>
        <CartProvider>
          <MenuThemeProvider>
          <BrandingProvider>
          <MenuLayoutProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mesa/:restaurantId/:tableId" element={<CustomerMenu />} />
              <Route path="/mesa/:restaurantId/:branchId/:tableId" element={<CustomerMenu />} />
              <Route path="/pedido/:orderId" element={<OrderStatus />} />
              <Route path="/pago/exito" element={<PaymentResult status="exito" />} />
              <Route path="/pago/error" element={<PaymentResult status="error" />} />
              <Route path="/pago/pendiente" element={<PaymentResult status="pendiente" />} />
              
              {/* Operational screens — public, no login required */}
              <Route path="/caja/:branchId" element={<CajaScreen />} />
              <Route path="/cocina/:branchId" element={<CocinaScreen />} />
              <Route path="/mozo/:branchId" element={<MozoScreen />} />

              {/* Super Admin */}
              <Route path="/superadmin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />

              {/* Admin auth */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/registro" element={<AdminSignup />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="menu" element={<AdminMenuPage />} />
                <Route path="rentabilidad" element={<AdminSalesProfit />} />
                <Route path="inteligencia" element={<AdminMenuIntelligence />} />
                <Route path="mesas" element={<AdminTables />} />
                <Route path="pagos" element={<AdminPayments />} />
                <Route path="sucursales" element={<AdminBranches />} />
                <Route path="diseno" element={<AdminThemes />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </MenuLayoutProvider>
          </BrandingProvider>
          </MenuThemeProvider>
        </CartProvider>
        </BranchProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
