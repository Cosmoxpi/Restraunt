import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { initializeDatabase } from './lib/database';
import { Toaster } from 'react-hot-toast';
import { setupScrollAnimations } from './lib/scrollAnimation';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OAuthCallback from './pages/OAuthCallback';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Always check for a session on mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          await handleUserAuthentication(currentUser, event);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // On mount, restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        handleUserAuthentication(currentUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserAuthentication = async (user, authEvent) => {
    // For both regular auth and OAuth
    try {
      // First check if user exists in admin table
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

      // Check if the admin exists and is approved
      if (!adminError && adminData && adminData.is_approved) {
        setIsAdmin(true);
        return;
      }

      // If user authenticated with OAuth and admin doesn't exist, check by email
      if (user.app_metadata?.provider && ['google', 'facebook'].includes(user.app_metadata.provider)) {
        // First check if any existing admin has this email but different ID
        // This would happen if they previously signed up with email but now using OAuth
        const { data: adminByEmail, error: emailError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .is('id', null) // Not yet linked to this auth account
          .single();

        if (!emailError && adminByEmail) {
          // Update the admin record with the new user ID
          const { error: updateError } = await supabase
            .from('admins')
            .update({ id: user.id })
            .eq('email', user.email);

          if (!updateError && adminByEmail.is_approved) {
            setIsAdmin(true);
            return;
          }
        }
      }

      // Not an admin or not approved
      setIsAdmin(false);

      // Make sure user has a profile entry
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await supabase.from('user_profiles').insert([
          {
            id: user.id,
            first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            created_at: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error in auth handling:', error);
      setIsAdmin(false);
    }
  };

  // Legacy function maintained for any code that might still call it
  const checkIfAdmin = async (userId) => {
    try {
      // Check if user is in admins table and is approved
      const { data, error } = await supabase
        .from('admins')
        .select('is_approved')
        .eq('id', userId)
        .eq('is_approved', true)
        .single();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up global scroll animations
    const cleanup = setupScrollAnimations();

    return cleanup;
  }, []);

  return (
    <>
      <Navbar user={user} />
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/menu" element={<Menu user={user} />} />
        <Route path="/checkout" element={<Checkout user={user} />} />
        <Route path="/orders" element={
          <ProtectedRoute user={user}>
            <OrderHistory user={user} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <AdminRoute user={user} isAdmin={isAdmin}>
            <AdminDashboard user={user} />
          </AdminRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
