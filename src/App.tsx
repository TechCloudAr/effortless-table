import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import CustomerMenu from "./pages/CustomerMenu";
import OrderStatus from "./pages/OrderStatus";
import PaymentResult from "./pages/PaymentResult";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminTables from "./pages/AdminTables";
import AdminLayout from "./components/admin/AdminLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mesa/:tableId" element={<CustomerMenu />} />
            <Route path="/pedido/:orderId" element={<OrderStatus />} />
            <Route path="/pago/exito" element={<PaymentResult status="exito" />} />
            <Route path="/pago/error" element={<PaymentResult status="error" />} />
            <Route path="/pago/pendiente" element={<PaymentResult status="pendiente" />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="menu" element={<AdminMenuPage />} />
              <Route path="mesas" element={<AdminTables />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
