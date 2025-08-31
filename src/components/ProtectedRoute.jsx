import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ user, children }) => {
  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUser(session?.user || null);
        setChecking(false);
      });
    } else {
      setChecking(false);
    }
  }, [user]);

  if (checking) {
    // Show a spinner or loading indicator
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;