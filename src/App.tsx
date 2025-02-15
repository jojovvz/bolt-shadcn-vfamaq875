import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/Navbar';
import Dashboard from '@/pages/Dashboard';
import ModuleView from '@/pages/ModuleView';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import CategoriesPage from '@/pages/admin/categories/page';
import ModulesPage from '@/pages/admin/modules/page';
import LessonsPage from '@/pages/admin/lessons/page';
import UsersPage from '@/pages/admin/users/page';
import RolesPage from '@/pages/admin/roles/page';
import { trpc } from './utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Router>
              <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-6">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/modules/:moduleId" element={<ModuleView />} />

                    {/* Admin routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <AdminLayout>
                            <Routes>
                              <Route path="/" element={<AdminDashboard />} />
                              <Route path="/categories" element={<CategoriesPage />} />
                              <Route path="/modules" element={<ModulesPage />} />
                              <Route path="/lessons" element={<LessonsPage />} />
                              <Route path="/users" element={<UsersPage />} />
                              <Route path="/roles" element={<RolesPage />} />
                            </Routes>
                          </AdminLayout>
                        </AdminRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
              <Toaster />
            </Router>
          </QueryClientProvider>
        </trpc.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
