import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const UserDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load recent orders');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome Back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/menu" className="btn btn-primary w-full block text-center">
              Browse Menu
            </Link>
            <Link to="/orders" className="btn btn-secondary w-full block text-center">
              View All Orders
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">User ID:</span> {user?.id}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link to="/orders" className="text-blue-600 hover:underline">View All</Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y">
            {orders.map(order => (
              <div key={order.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total?.toFixed(2) || '0.00'}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't placed any orders yet.</p>
            <Link to="/menu" className="btn btn-primary mt-4 inline-block">
              Browse Menu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;