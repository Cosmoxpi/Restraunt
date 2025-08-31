import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

const Dashboard = ({ user }) => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        // Check if user is in admins table and is approved
        const { data, error } = await supabase
          .from('admins')
          .select('is_approved')
          .eq('id', user.id)
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
    
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentOrders(data || []);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        toast.error('Failed to load recent orders');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setUserProfile(data);
          setAddress(data.address || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      checkIfAdmin();
      fetchRecentOrders();
      fetchUserProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleSaveAddress = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          address,
          updated_at: new Date()
        });

      if (error) throw error;

      setIsEditingAddress(false);
      setUserProfile({
        ...userProfile,
        address
      });
      toast.success('Delivery address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Dashboard header with orange background */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-orange-100 text-lg">Manage your account and track your orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-orange-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                    {!isEditingAddress ? (
                      <div className="flex justify-between items-start mt-1">
                        <p className="text-gray-800">
                          {address ? address : (
                            <span className="text-gray-400 italic">No delivery address saved</span>
                          )}
                        </p>
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="ml-2 text-sm text-orange-500 hover:text-orange-600"
                        >
                          {address ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <textarea
                          value={address}
                          onChange={handleAddressChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          rows="3"
                          placeholder="Enter your delivery address"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setIsEditingAddress(false);
                              setAddress(userProfile?.address || '');
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveAddress}
                            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{user?.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link to="/menu" className="flex items-center justify-center w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-center transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Browse Menu
              </Link>
              
              {!isAdmin && (
                <Link to="/orders" className="flex items-center justify-center w-full py-4 px-6 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold rounded-lg text-center transition duration-300 shadow-md hover:shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Orders
                </Link>
              )}
              
              <button 
                onClick={handleSignOut}
                className="flex items-center justify-center w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-center transition duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders - Only shown for non-admin users */}
        {!isAdmin && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-orange-500">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <Link to="/orders" className="text-sm bg-white text-orange-500 hover:bg-orange-100 px-3 py-1 rounded-full font-medium">View All</Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="p-6 hover:bg-orange-50 transition duration-150">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-800">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(order.total_amount)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium inline-flex items-center"
                      >
                        View Details
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <svg className="w-16 h-16 text-orange-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 18l2-2m0 0l4-4m-4 4l-4-4m-4 4l4 4m-4-4l-4-4"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l-5-5 5-5"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h9"/>
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-1">You haven't placed any orders yet</h3>
                <p className="text-gray-500 mb-4">Start exploring our delicious menu and place your first order!</p>
                <Link to="/menu" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition duration-300">
                  Browse Our Menu
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
