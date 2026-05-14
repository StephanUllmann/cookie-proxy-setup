import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ToasterContext } from './ToasterContext.tsx';
import type { LoginForm, RegisterForm, User } from '@/types/index.ts';

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  register: (formState: RegisterForm) => Promise<void>;
  login: (formState: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  isRefreshing: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const navigate = useNavigate();

  const toasterContext = useContext(ToasterContext);
  const toaster = toasterContext?.toaster;

  const register = async (formState: RegisterForm) => {
    try {
      const res = await fetch(`api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Error registering');
      const data = await res.json();

      console.log(data);
      setUser(data.user);

      toaster?.success(`Welcome on board, ${data.user.firstName}`);
      navigate('/books');
    } catch (error) {
      if (error instanceof Error) {
        toaster?.error(error.message);
      }
    }
  };

  const login = async (formState: LoginForm) => {
    try {
      const res = await fetch(`api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Error logging in');
      const data = await res.json();

      console.log(data);
      setUser(data.user);

      toaster?.success(`Welcome back, ${data.user.firstName}`);

      navigate('/books');
    } catch (error) {
      if (error instanceof Error) {
        toaster?.error(error.message);
      }
    }
  };

  const logout = async () => {
    try {
      const res = await fetch(`api/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error logging out');

      setUser(null);

      navigate('/');

      toaster?.success(`Bye`);
    } catch {
      toaster?.error('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch(`api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        setUser(data.user);
      } catch {
        navigate('/');
      } finally {
        setIsRefreshing(false);
      }
    };
    if (isRefreshing) refresh();
  }, []);

  return (
    <AuthContext
      value={{ user, setUser, register, login, logout, isRefreshing }}
    >
      {children}
    </AuthContext>
  );
};

export default AuthContextProvider;
