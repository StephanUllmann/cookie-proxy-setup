import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function ProtectedLayout() {
  const { user, isRefreshing } = useContext(AuthContext)!;

  const navigate = useNavigate();

  useEffect(() => {
    if (isRefreshing) return;
    if (!user) navigate('register');
  }, [isRefreshing, user]);

  if (!user) return null;

  return <Outlet />;
}
