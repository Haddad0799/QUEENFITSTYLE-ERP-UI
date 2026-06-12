import './App.css';
import type { ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { PageShell } from './layout/PageShell';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ProductCreatePage } from './pages/ProductCreatePage';
import { ProductImportPage } from './pages/ProductImportPage';
import { OrdersPage } from './pages/OrdersPage';
import { StockPage } from './pages/StockPage';
import { StockProductDetailsPage } from './pages/StockProductDetailsPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { ToastProvider } from './components/toast/ToastProvider';
import { AuthProvider, useAuth } from './auth/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <PageShell>
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/products" replace />}
                      />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route
                        path="/products/new"
                        element={<ProductCreatePage />}
                      />
                      <Route
                        path="/products/import"
                        element={<ProductImportPage />}
                      />
                      <Route
                        path="/products/:id"
                        element={<ProductDetailsPage />}
                      />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/stock" element={<StockPage />} />
                      <Route
                        path="/stock/:id"
                        element={<StockProductDetailsPage />}
                      />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route
                        path="/orders/:id"
                        element={<OrderDetailsPage />}
                      />
                      <Route
                        path="*"
                        element={
                          <div className="flex h-full items-center justify-center text-muted">
                            Página não encontrada.
                          </div>
                        }
                      />
                    </Routes>
                  </PageShell>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

/**
 * Garante que rotas internas só rendem com sessão ativa. Sem token,
 * redireciona para /login preservando a URL tentada para retorno
 * automático após o login.
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <>{children}</>;
}

/**
 * Login: se o usuário já está autenticado, evita mostrar o form e
 * redireciona para a home (ou para o destino que tentou acessar).
 */
function LoginRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }
  return <LoginPage />;
}

export default App;
