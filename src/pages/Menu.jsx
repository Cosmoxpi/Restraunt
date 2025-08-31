import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FoodCard from '../components/FoodCard';
import { formatCurrency } from '../lib/utils';
import CategoryTabs from '../components/CategoryTabs';
import { setupScrollAnimations } from '../lib/scrollAnimation';

const Menu = ({ user }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setMenuItems(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchMenuItems();
  }, []);
  
  // Filter menu items by category
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  // Add this after fetching menu items
  useEffect(() => {
    if (menuItems.length > 0) {
      console.log('Menu Items:', menuItems);
      console.log('Categories:', categories);
    }
  }, [menuItems, categories]);
  
  useEffect(() => {
    // Set up scroll animations
    const cleanup = setupScrollAnimations();
    
    // Clean up on component unmount
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Menu Header with Wave Animation */}
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4 text-white animate-on-scroll">Our Menu</h1>
          <p className="text-xl text-white font-bold max-w-2xl mx-auto animate-on-scroll stagger-delay-1">Explore our delicious offerings 🍕</p>
        </div>
        
        {/* Wave Animation - Fixed to ensure it shows on all devices */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-16">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Use the improved CategoryTabs component */}
      <div className="flex justify-center px-4 animate-on-scroll stagger-delay-2">
        <CategoryTabs 
          categories={categories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>
      
      {/* Menu Items Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div key={item.id} className={`animate-on-scroll stagger-delay-${(index % 4) + 1}`}>
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-on-scroll">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;