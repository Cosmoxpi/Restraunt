import { Link } from 'react-router-dom';

const Hero = ({ user }) => {
  return (
    <section className="relative w-full min-h-[550px] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Floating Food Icons */}
      <img src="https://img.icons8.com/color/96/000000/hamburger.png" alt="burger" className="absolute left-10 bottom-10 w-16 h-16 animate-float z-10" />
      <img src="https://img.icons8.com/color/96/000000/pizza.png" alt="pizza" className="absolute right-20 top-20 w-16 h-16 animate-float-slow z-10" />
      <img src="https://img.icons8.com/color/96/000000/cupcake.png" alt="cupcake" className="absolute left-1/2 top-8 w-12 h-12 animate-float-reverse z-10" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-2xl px-6 py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-2xl animate-hero-title">
          Savor Every Bite<br />
          <span className="text-orange-400">Delicious Food Delivered</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-8 animate-hero-sub">
          Fresh flavors, fast delivery, and a menu you’ll love. Experience the best food delivery in town!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/menu" className="px-8 py-3 bg-gradient-to-r from-orange-400 to-yellow-300 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-orange-500 hover:to-yellow-400 transition-all duration-300 animate-hero-btn">
            Browse Menu
          </Link>
          {!user && (
            <Link to="/signup" className="px-8 py-3 bg-white text-orange-500 font-bold rounded-full border-2 border-orange-400 hover:bg-orange-50 shadow-lg transition-all duration-300 animate-hero-btn">
              Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Custom Animations & Fonts */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap');
      section, h1, h2, h3, h4, h5, h6, p, a, button, span, div {
        font-family: 'Montserrat', 'Inter', 'Poppins', Arial, sans-serif;
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-18px); }
        100% { transform: translateY(0px); }
      }
      @keyframes float-slow {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-28px); }
        100% { transform: translateY(0px); }
      }
      @keyframes float-reverse {
        0% { transform: translateY(0px); }
        50% { transform: translateY(15px); }
        100% { transform: translateY(0px); }
      }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
      .animate-float-reverse { animation: float-reverse 3.5s ease-in-out infinite; }
      @keyframes hero-title {
        0% { opacity: 0; transform: translateY(-40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-hero-title { animation: hero-title 1.1s cubic-bezier(0.4,0,0.2,1) forwards; }
      @keyframes hero-sub {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-hero-sub { animation: hero-sub 1.3s cubic-bezier(0.4,0,0.2,1) forwards; }
      @keyframes hero-btn {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      .animate-hero-btn { animation: hero-btn 1.7s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>
    </section>
  );
};

export default Hero;