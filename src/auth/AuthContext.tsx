import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_UNAUTHORIZED_EVENT,
} from '../lib/api-client';
import { authService } from '../services/auth';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const readInitialToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readInitialToken());
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const persistToken = useCallback((next: string | null) => {
    try {
      if (next) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, next);
      } else {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch {
      // ignorar quando storage estiver indisponível
    }
    setToken(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoggingIn(true);
      try {
        const response = await authService.login({
          email: email.trim(),
          password,
        });
        if (!response?.token) {
          throw new Error('Resposta de login inválida.');
        }
        persistToken(response.token);
      } finally {
        setIsLoggingIn(false);
      }
    },
    [persistToken],
  );

  const logout = useCallback(() => {
    persistToken(null);
  }, [persistToken]);

  /**
   * Sincroniza com (1) eventos de 401 emitidos pelo api-client e (2)
   * mudanças no localStorage feitas por outras abas — assim, deslogar
   * em uma aba propaga para as outras.
   */
  useEffect(() => {
    const handleUnauthorized = () => setToken(null);
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== AUTH_TOKEN_STORAGE_KEY) return;
      setToken(e.newValue);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isLoggingIn,
      login,
      logout,
    }),
    [token, isLoggingIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider />');
  }
  return ctx;
}
