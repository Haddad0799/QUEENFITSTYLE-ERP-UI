import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PageShell } from './layout/PageShell';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ProductCreatePage } from './pages/ProductCreatePage';
import { ProductImportPage } from './pages/ProductImportPage';

function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductCreatePage />} />
          <Route path="/products/import" element={<ProductImportPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
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
    </BrowserRouter>
  );
}

export default App;
