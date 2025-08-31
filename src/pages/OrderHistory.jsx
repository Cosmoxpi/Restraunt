import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { toast } from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        // Fetch orders for the user
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch order items for all orders
        const orderIds = ordersData.map(order => order.id);
        let orderItemsMap = {};
        if (orderIds.length > 0) {
          const { data: orderItemsData, error: orderItemsError } = await supabase
            .from('order_items')
            .select('*, menu_item_id, menu_items(name, price)')
            .in('order_id', orderIds);

          if (orderItemsError) throw orderItemsError;

          // Group items by order_id
          orderItemsMap = orderItemsData.reduce((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push({
              name: item.menu_items?.name || '',
              price: item.menu_items?.price || 0,
              quantity: item.quantity
            });
            return acc;
          }, {});
        }

        // Attach items to each order
        const ordersWithItems = ordersData.map(order => ({
          ...order,
          items: orderItemsMap[order.id] || []
        }));

        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Order History</h1>
            <p className="text-orange-100 mt-2">View and track all your delicious orders</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
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
                    <div className="mt-4 md:mt-0">
                      <span className="text-xl font-bold text-orange-600">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">{item.quantity}x</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      )) || <p className="text-sm text-gray-500">No items available</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm font-medium text-orange-600 hover:text-orange-500"
                    >
                      View Details →
                    </Link>
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">You haven't placed any orders yet</h3>
              <p className="mt-2 text-sm text-gray-500">Start exploring our delicious menu and place your first order!</p>
              <div className="mt-6">
                <Link
                  to="/menu"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Browse Menu
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;