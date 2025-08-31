import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getPopularItems } from '../lib/database';
import FoodCard from '../components/FoodCard';
import Hero from '../components/Hero';

const Home = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Fetch popular menu items
    const fetchPopularItems = async () => {
      try {
        const items = await getPopularItems();
        // Make sure items is an array before setting state
        setPopularItems(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error('Error fetching popular items:', error);
        setPopularItems([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPopularItems();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <Hero user={user} />
      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-orange-500 uppercase mb-2" style={{fontFamily: 'Montserrat, Inter, Poppins, Arial, sans-serif'}}>Why Choose Us</h2>
            <p className="mt-2 text-xl md:text-3xl font-bold text-gray-800" style={{fontFamily: 'Montserrat, Inter, Poppins, Arial, sans-serif'}}>
              We're committed to providing the <span className="text-orange-400">best food delivery experience</span> with quality ingredients and excellent service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-3xl bg-gradient-to-br from-white via-orange-50 to-yellow-100 shadow-2xl p-8 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-orange-200" style={{fontFamily: 'Montserrat, Inter, Poppins, Arial, sans-serif'}}>
              <span className="text-5xl mb-4">🍃</span>
              <h4 className="font-extrabold text-lg md:text-xl mb-2 text-orange-500">Fresh Ingredients</h4>
              <p className="text-gray-600 text-center text-base md:text-lg">We use only the freshest and highest quality ingredients for every dish.</p>
            </div>
            {/* Card 2 */}
            <div className="rounded-3xl bg-gradient-to-br from-white via-yellow-50 to-orange-100 shadow-2xl p-8 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-yellow-200" style={{fontFamily: 'Montserrat, Inter, Poppins, Arial, sans-serif'}}>
              <span className="text-5xl mb-4">🚚</span>
              <h4 className="font-extrabold text-lg md:text-xl mb-2 text-orange-500">Fast Delivery</h4>
              <p className="text-gray-600 text-center text-base md:text-lg">Get your food delivered hot and on time, every time.</p>
            </div>
            {/* Card 3 */}
            <div className="rounded-3xl bg-gradient-to-br from-white via-orange-50 to-yellow-100 shadow-2xl p-8 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-orange-100" style={{fontFamily: 'Montserrat, Inter, Poppins, Arial, sans-serif'}}>
              <span className="text-5xl mb-4">⭐</span>
              <h4 className="font-extrabold text-lg md:text-xl mb-2 text-orange-500">Top Rated Service</h4>
              <p className="text-gray-600 text-center text-base md:text-lg">Our customers love us for our service and attention to detail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Popular Items</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our customers' favorite dishes that you might want to try.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : popularItems.length > 0 ? (
            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {popularItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center mt-8">
              <p className="text-gray-500">No popular items found.</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center px-7 py-3 border border-transparent text-base font-semibold rounded-full text-white bg-gradient-to-r from-orange-500 to-red-400 shadow-lg hover:from-orange-600 hover:to-red-500 transition duration-300"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


{/* Hero Section with wave shape */}
<div className="relative bg-cover bg-center min-h-[500px] flex items-center" 
     style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")' }}>
  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
  
  {/* Add subtle pattern overlay */}
  <div className="absolute inset-0 bg-repeat opacity-10" 
       style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
  
  <div className="container mx-auto px-4 relative z-10 text-center">
    <div className="max-w-3xl mx-auto">
      <span className="inline-block text-orange-400 text-2xl mb-2">🧁</span>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">Savor Every Bite</h1>
      <div className="w-24 h-1 bg-orange-400 mx-auto mb-4"></div>
      <h2 className="text-3xl md:text-4xl font-bold text-orange-400 mb-6 drop-shadow-md">Delicious Food Delivered</h2>
      <p className="text-xl text-white mb-8 max-w-xl mx-auto">
        Fresh flavors, fast delivery, and a menu you'll love. Experience the best food delivery in town!
      </p>
      <a href="/menu" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-1">
        Browse Menu
      </a>
    </div>
  </div>
  
  {/* Decorative wave shape at the bottom */}
  <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 text-white fill-current">
      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
      <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
      <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
    </svg>
  </div>
</div>