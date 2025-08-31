import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate form
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate email format with a proper regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // First create the Supabase auth account (for both admin and regular users)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      // If signup successful
      if (data?.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at === null) {
          // Email confirmation required
          if (isAdmin) {
            // For admin users - store data in the admins table
            const { error: adminError } = await supabase
              .from('admins')
              .insert([
                { 
                  id: data.user.id,
                  email: email,
                  first_name: firstName,
                  last_name: lastName,
                  phone: phone,
                  is_admin: true,
                  created_at: new Date(),
                  updated_at: new Date()
                }
              ]);

            if (adminError) {
              console.error('Error creating admin record:', adminError);
              toast.error('Admin account created but role assignment failed');
            } else {
              toast.success('Admin signup successful! Please check your email to confirm your account before logging in.');
            }
          } else {
            // For regular users - store data in user_profiles table
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert([
                { 
                  id: data.user.id,
                  first_name: firstName,
                  last_name: lastName,
                  phone: phone,
                  created_at: new Date()
                }
              ]);

            if (profileError) {
              console.error('Error creating user profile:', profileError);
              toast.error('Account created but profile setup failed');
            } else {
              toast.success('Signup successful! Please check your email to confirm your account before logging in.');
            }
          }
          
          // Show additional information about email confirmation
          toast.success('Account created successfully! Please check your email (including spam folder) and click the confirmation link to activate your account.', { duration: 6000 });
          navigate('/login');
          return;
        }
        if (isAdmin) {
          // For admin users - store data in the admins table
          const { error: adminError } = await supabase
            .from('admins')
            .insert([
              { 
                id: data.user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                is_admin: true,
                created_at: new Date(),
                updated_at: new Date()
              }
            ]);

          if (adminError) {
            console.error('Error creating admin record:', adminError);
            toast.error('Admin account created but role assignment failed');
          } else {
            toast.success('Admin signup successful! You can now log in.');
          }
        } else {
          // For regular users - store data in user_profiles table
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              { 
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                created_at: new Date()
              }
            ]);

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            toast.error('Account created but profile setup failed');
          } else {
            toast.success('Signup successful! You can now log in.');
          }
        }
        navigate('/login');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-200">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-orange-100 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 rounded-full p-3 mb-2 shadow">
            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight text-center">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {/* Email confirmation info */}
        <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> After signing up, you'll receive a confirmation email. Please check your inbox (and spam folder) and click the confirmation link to activate your account.
              </p>
            </div>
          </div>
        </div>
        
        <form className="w-full space-y-5" onSubmit={handleSignup}>
          <div>
            <label htmlFor="first-name" className="sr-only">First Name</label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition shadow-sm"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="last-name" className="sr-only">Last Name</label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition shadow-sm"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="sr-only">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition shadow-sm"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition shadow-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition shadow-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition shadow-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <input
              id="is-admin"
              name="is-admin"
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="is-admin" className="ml-2 block text-sm text-gray-900">
              Sign up as Admin
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg shadow transition disabled:opacity-60"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;