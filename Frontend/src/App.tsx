
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProtectedRoute from "@/components/index/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Battle from "./pages/Battle";
import CreateBattle from "./pages/CreateBattle";
import JoinBattle from "./pages/JoinBattle";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import { SpectateBattle } from "./pages/SpectateBattle";
import NotFound from "./pages/NotFound";
import axios from "axios";
import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient();

axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "http://localhost:3000";
    
const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
      <AuthProvider>
        <ProfileProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/battle" element={
                <ProtectedRoute>
                  <Battle />
                </ProtectedRoute>
              } />
              <Route path="/battle/:id" element={
                <ProtectedRoute>
                  <Battle />
                </ProtectedRoute>
              } />
              <Route path="/create-battle" element={
                <ProtectedRoute>
                  <CreateBattle />
                </ProtectedRoute>
              } />
              <Route path="/join-battle" element={
                <ProtectedRoute>
                  <JoinBattle />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/spectate/:battleId" element={
                <ProtectedRoute>
                  <SpectateBattle />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </ProfileProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
