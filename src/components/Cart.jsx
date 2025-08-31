import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

const Cart = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [isOpen]); // Reload cart when cart is opened
  
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  
  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared');
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
    onClose();
  };
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300">
        <div className="p-4 border-b flex justify-between items-center bg-orange-500 text-white">
          <h2 className="text-xl font-bold">Your Cart ({totalItems} items)</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="divide-y divide-gray-200">
                {cart.map(item => (
                  <li key={item.id} className="py-4 flex">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:text-orange-500"
                          >
                            -
                          </button>
                          <span className="px-2 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:text-orange-500"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
              <div className="flex justify-center text-center text-sm text-gray-500">
                <button
                  type="button"
                  className="font-medium text-orange-500 hover:text-orange-600"
                  onClick={onClose}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;