import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';

const FoodCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  
  // Add null check for the item prop
  if (!item) {
    return <div className="bg-gray-200 rounded-full h-64 animate-pulse"></div>;
  }

  // Use a more reliable fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
  
  // Use optional chaining and default values to prevent errors
  const imageUrl = !imageError ? (item.image_url || fallbackImage) : fallbackImage;
  const name = item.name || 'Unnamed Item';
  const price = item.price || 0;
  const description = item.description || 'No description available';

  const handleImageError = () => {
    setImageError(true);
    console.log(`Image failed to load for: ${name}`);
  };

  const addToCart = () => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Increment quantity if item exists
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item with quantity 1
      existingCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: imageUrl,
        quantity: 1
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="food-card-container">
      <div className="food-card-circular">
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="food-image-circular"
            onError={handleImageError}
            loading="lazy"
          />
          {item.is_popular && (
            <span className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              Popular
            </span>
          )}
        </div>
        <div className="food-card-content">
          <h3 className="food-title">{name}</h3>
          <p className="food-description">{description}</p>
          <div className="food-card-footer">
            <span className="food-price">{formatCurrency(price)}</span>
            <button 
              onClick={addToCart}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;