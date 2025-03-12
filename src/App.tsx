// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentDataCollection from "./components/StudentDataCollection";
import StudentNumber from "./components/StudentNumber";
import { AdminLayout } from "./components/AdminLayout";
import { AdminLogin } from "./pages/AdminLogin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import FundTracker from "./accounts/FundTraker";
import AcademicRoutine from "../src/academic/AcademicRoutine";
import "../toast.css";
import AdminOverview from "./components/AdminOverview";
import TeachersPanel from "./teachers/TeachersPanel";
import SmsService from "./smsservcie/SmsService"
import MySchoolChat from "./myschool-chat/MySchoolChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/submit-student-data"
            element={<StudentDataCollection />}
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route index path="/admin/student-menagement" element={<StudentNumber />} />
            <Route index path="/admin/accounts&fund" element={<FundTracker />} />
            <Route index path="/admin/academic" element={<AcademicRoutine />} />
            <Route index path="/admin/staff" element={<TeachersPanel />} />
            <Route index path="/admin/sms-service" element={<SmsService />} />
            <Route index path="/admin/myschool-ai" element={<MySchoolChat />} />
            {/* Add more admin routes here as needed */}
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;