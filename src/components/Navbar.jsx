import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Cart from './Cart';

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orderCount, setOrderCount] = useState(0); // NEW: state for order count
  const location = useLocation();

  useEffect(() => {
    // Check if the user is an admin when the user changes
    if (user) {
      checkIfAdmin(user.id);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch new order count if admin
    const fetchOrderCount = async () => {
      if (isAdmin) {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'); // Only count new/pending orders
        if (!error) setOrderCount(count || 0);
      }
    };
    fetchOrderCount();
  }, [isAdmin]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-bold text-orange-500">Ginni's Cafe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
              Home
            </Link>
            <Link to="/menu" className={`nav-link ${location.pathname === '/menu' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
              Menu
            </Link>
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin-dashboard" className={`nav-link ${location.pathname === '/admin-dashboard' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                    <span className="flex items-center relative">
                      Manage Orders
                      {orderCount > 0 && (
                        <span className="ml-2 absolute -top-2 -right-5 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center z-10">
                          {orderCount}
                        </span>
                      )}
                    </span>
                  </Link>
                ) : (
                  <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                    Orders
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors duration-200">
                    <span>Account</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    {isAdmin ? (
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200">
                        Profile
                      </Link>
                    ) : (
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200">
                        Profile
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                  Login
                </Link>
                <Link to="/signup" className={`${location.pathname === '/signup' ? 'bg-orange-600 font-bold' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-full transition-colors duration-200`}>
                  Sign Up
                </Link>
              </>
            )}
            {/* Only show Cart if NOT admin */}
            {user && !isAdmin && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {/* Cart item count would go here */}
                </span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-orange-500 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-3">
            <Link to="/" className={`block py-2 ${location.pathname === '/' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
              Home
            </Link>
            <Link to="/menu" className={`block py-2 ${location.pathname === '/menu' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
              Menu
            </Link>
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin-dashboard" className={`block py-2 ${location.pathname === '/admin-dashboard' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                    <div className="flex items-center relative">
                      Manage Orders
                      {orderCount > 0 && (
                        <span className="ml-2 absolute -top-2 -right-5 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center z-10">
                          {orderCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ) : null}
                {/* Only show Orders and Cart if NOT admin */}
                {!isAdmin && (
                  <>
                    <Link to="/orders" className={`block py-2 ${location.pathname === '/orders' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                      Orders
                    </Link>
                    <button 
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center py-2 text-gray-700 hover:text-orange-500 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Cart
                    </button>
                  </>
                )}
                <Link to="/dashboard" className={`block py-2 ${location.pathname === '/dashboard' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 hover:text-orange-500 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`block py-2 ${location.pathname === '/login' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                  Login
                </Link>
                <Link to="/signup" className={`block py-2 ${location.pathname === '/signup' ? 'text-orange-500 font-bold' : 'text-gray-700 hover:text-orange-500 transition-colors duration-200'}`}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;