import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrders();
    fetchPendingAdmins();
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);


  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Fetch orders with their items count
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // For each order, get the count of items
      const ordersWithItemCount = await Promise.all(ordersData.map(async (order) => {
        const { count, error: countError } = await supabase
          .from('order_items')
          .select('*', { count: 'exact', head: true })
          .eq('order_id', order.id);

        return {
          ...order,
          itemCount: countError ? 0 : count
        };
      }));

      setOrders(ordersWithItemCount || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      setLoadingAdmins(true);

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingAdmins(data || []);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      toast.error('Failed to load pending admin requests');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const approveAdmin = async (adminId) => {
    if (!currentUser) {
      toast.error('You must be logged in to approve admins');
      return;
    }

    try {
      const { error } = await supabase
        .from('admins')
        .update({
          is_approved: true,
          approved_by: currentUser.id,
          approved_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', adminId);

      if (error) throw error;

      // Update local state by removing the approved admin
      setPendingAdmins(pendingAdmins.filter(admin => admin.id !== adminId));

      toast.success('Admin approved successfully');
    } catch (error) {
      console.error('Error approving admin:', error);
      toast.error('Failed to approve admin');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-orange-100">
        {/* <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent inline-block">Orders List</h1> */}
        {/* <p className="text-gray-500 text-sm mb-6">Manage orders</p> */}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto pb-px">
          <ul className="flex text-sm font-medium text-center">
            {/* <li className="mr-2">
              <button
                className={`inline-block px-3 sm:px-4 py-3 rounded-t-lg border-b-2 ${activeTab === 'orders'
                  ? 'text-orange-600 border-orange-600 font-bold'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
            </li> */}
            {/* <li className="mr-2">
              <button
                className={`inline-block px-3 sm:px-4 py-3 rounded-t-lg border-b-2 ${activeTab === 'pendingAdmins'
                  ? 'text-orange-600 border-orange-600 font-bold'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                onClick={() => setActiveTab('pendingAdmins')}
              >
                Pending Admins
                {pendingAdmins.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {pendingAdmins.length}
                  </span>
                )}
              </button>
            </li> */}
          </ul>
        </div>

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
              <h2 className="text-xl font-semibold text-white">Manage Orders</h2>
              <button
                onClick={fetchOrders}
                className="py-2 px-4 bg-white text-orange-600 rounded-md hover:bg-orange-100 transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 sm:py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 absolute top-0 left-0"></div>
                </div>
              </div>
            ) : orders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-orange-50 transition-colors duration-150">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900">Order #{order.id.substring(0, 8)}</span>
                          <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <span className="text-xl font-bold text-orange-600">₹{order.total_amount?.toFixed(2) || '0.00'}</span>
                        <span className="text-xs text-gray-400 mt-1">{order.itemCount} items</span>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            disabled={order.status === 'processing'}
                          >
                            Mark Processing
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                            disabled={order.status === 'completed'}
                          >
                            Mark Completed
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500">Delivery Address: <span className="text-gray-700">{order.delivery_address}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-2 text-sm text-gray-500">No orders have been placed yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Pending Admins Tab Content */}
        {activeTab === 'pendingAdmins' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Pending Admin Approvals</h2>
              <button
                onClick={fetchPendingAdmins}
                className="py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                disabled={loadingAdmins}
              >
                {loadingAdmins ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loadingAdmins ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : pendingAdmins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border-b">Name</th>
                      <th className="text-left p-3 border-b">Email</th>
                      <th className="text-left p-3 border-b">Phone</th>
                      <th className="text-left p-3 border-b">Date Requested</th>
                      <th className="text-left p-3 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAdmins.map(admin => (
                      <tr key={admin.id} className="hover:bg-gray-50 border-b border-gray-200">
                        <td className="p-3">{admin.first_name} {admin.last_name}</td>
                        <td className="p-3">{admin.email}</td>
                        <td className="p-3">{admin.phone || 'N/A'}</td>
                        <td className="p-3">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => approveAdmin(admin.id)}
                            className="py-1 px-3 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No pending admin approvals.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;