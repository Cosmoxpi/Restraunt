import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the current session to confirm authentication worked
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Authentication failed');
        }

        const user = session.user;
        
        // Check if user wanted to login as admin
        const loginAsAdmin = localStorage.getItem('loginAsAdmin') === 'true';
        
        if (loginAsAdmin) {
          // Check if admin record exists
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (adminError && adminError.code === 'PGRST116') {
            // Admin doesn't exist, check by email
            const { data: adminByEmail, error: emailError } = await supabase
              .from('admins')
              .select('*')
              .eq('email', user.email)
              .single();
              
            if (emailError && emailError.code === 'PGRST116') {
              // No admin record exists for this email, create one
              const { error: createError } = await supabase
                .from('admins')
                .insert([
                  {
                    id: user.id,
                    email: user.email,
                    first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
                    last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    is_admin: true,
                    is_approved: false,
                    created_at: new Date()
                  }
                ]);
                
              if (createError) {
                console.error('Error creating admin record:', createError);
                toast.error('Failed to create admin account. Please try again.');
                navigate('/login');
                return;
              }
              
              toast.success('Admin account created! Waiting for approval.');
              navigate('/login');
              return;
            } else if (!emailError && adminByEmail) {
              // Admin exists with this email but different ID, update it
              const { error: updateError } = await supabase
                .from('admins')
                .update({ id: user.id })
                .eq('email', user.email);
                
              if (updateError) {
                console.error('Error updating admin ID:', updateError);
              }
              
              // Check if admin is approved
              if (adminByEmail.is_approved) {
                toast.success('Admin login successful!');
                navigate('/admin-dashboard');
              } else {
                toast.error('Your admin account is pending approval.');
                await supabase.auth.signOut();
                navigate('/login');
              }
              return;
            }
          } else if (!adminError && adminData) {
            // Admin exists, check if approved
            if (adminData.is_approved) {
              toast.success('Admin login successful!');
              navigate('/admin-dashboard');
            } else {
              toast.error('Your admin account is pending approval.');
              await supabase.auth.signOut();
              navigate('/login');
            }
            return;
          }
        }
        
        // Make sure user has a profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code === 'PGRST116') {
          // Create user profile
          const { error: createProfileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: user.id,
                first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                created_at: new Date()
              }
            ]);
            
          if (createProfileError) {
            console.error('Error creating user profile:', createProfileError);
          }
        }
        
        // For regular user login or failed admin login
        toast.success('Login successful!');
        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Login failed. Please try again.');
        navigate('/login');
      } finally {
        // Clean up
        localStorage.removeItem('loginAsAdmin');
        setLoading(false);
      }
    };
    
    handleOAuthCallback();
  }, [navigate, location]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-orange-700 mb-4">Completing Login</h1>
        {loading && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700">Please wait while we complete your login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
