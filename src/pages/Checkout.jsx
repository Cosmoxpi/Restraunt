import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';

const Checkout = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load user's saved address if available
    const fetchUserAddress = async () => {
      if (user) {
        try {
          setLoadingAddress(true);
          const { data, error } = await supabase
            .from('user_profiles')
            .select('address')
            .eq('id', user.id)
            .single();

          if (!error && data && data.address) {
            setAddress(data.address);
          }
        } catch (error) {
          console.error('Error fetching address:', error);
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    fetchUserAddress();
  }, [user]);

  // Add the handleCheckout function here, outside of the JSX
  const handleCheckout = () => {
    // Implement checkout logic here
    console.log('Processing checkout...');

    // Validate form
    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    // Call the existing handleSubmitOrder function
    handleSubmitOrder(new Event('submit'));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));

    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(
      cart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item)
    ));
  };

  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);

    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared');
  };

  // Update handleSubmitOrder to include paymentMethod
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!address.trim()) {
      setAddressError('Delivery address is required');
      toast.error('Please enter your delivery address');
      return;
    }

    if (address.trim().length < 10) {
      setAddressError('Please enter a complete address');
      toast.error('Please enter a complete delivery address');
      return;
    }

    try {
      setLoading(true);

      // Calculate total amount
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = subtotal > 0 ? 2.99 : 0;
      const finalTotal = totalAmount + deliveryFee;

      // Step 1: Insert the main order with payment_method
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            delivery_address: address,
            status: 'pending',
            total_amount: finalTotal,
            delivery_fee: deliveryFee,
            payment_method: paymentMethod // <-- add this line
          }
        ])
        .select();

      if (orderError) throw orderError;

      // Get the new order ID
      const orderId = orderData[0].id;

      // Step 2: Insert order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      clearCart();

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.message || 'Error placing order');
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Checkout header with orange background */}
        <div className="bg-orange-500 text-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-orange-100">Complete your order and enjoy delicious food</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some delicious items to your cart and come back</p>
              <Link to="/menu" className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full transition duration-300">
                Browse Menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-700">Order Items</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <li key={item.id} className="px-6 py-4 flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-orange-500 p-1"
                          disabled={item.quantity <= 1}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="mx-2 text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-orange-500 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order summary section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="flex space-x-4 mb-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={() => setPaymentMethod("Cash on Delivery")}
                        className="form-radio text-orange-500"
                      />
                      <span className="ml-2">Cash on Delivery</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Online Payment"
                        checked={paymentMethod === "Online Payment"}
                        onChange={() => setPaymentMethod("Online Payment")}
                        className="form-radio text-orange-500"
                      />
                      <span className="ml-2">Online Payment</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                  {loadingAddress ? (
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-500">Loading saved address...</span>
                    </div>
                  ) : null}
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    className={`w-full p-3 border ${addressError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-orange-500 focus:border-orange-500`}
                    placeholder="Enter your complete delivery address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (e.target.value.trim()) {
                        setAddressError('');
                      }
                    }}
                    onBlur={() => {
                      if (!address.trim()) {
                        setAddressError('Delivery address is required');
                      } else if (address.trim().length < 10) {
                        setAddressError('Please enter a complete address');
                      } else {
                        setAddressError('');
                      }
                    }}
                    required
                  ></textarea>
                  {addressError && (
                    <p className="mt-1 text-sm text-red-600">{addressError}</p>
                  )}
                  {address && !addressError && (
                    <p className="mt-1 text-sm text-green-600">✓ Address looks good</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (!address.trim()) {
                      setAddressError('Delivery address is required');
                      toast.error('Please enter your delivery address');
                      return;
                    }
                    if (address.trim().length < 10) {
                      setAddressError('Please enter a complete address');
                      toast.error('Please enter a complete delivery address');
                      return;
                    }
                    setProcessing(true);
                    handleCheckout();
                    setTimeout(() => setProcessing(false), 2000); // Simulate processing
                  }}
                  disabled={loading || processing || loadingAddress}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-orange-300 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : loadingAddress ? (
                    'Loading Address...'
                  ) : (
                    'Complete Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
