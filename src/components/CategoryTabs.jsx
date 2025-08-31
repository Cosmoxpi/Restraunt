import React from 'react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="bg-white shadow-md rounded-full mx-auto max-w-4xl -mt-6 overflow-hidden relative z-20">
      <div className="flex p-2 space-x-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeCategory === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'text-gray-700 hover:bg-orange-100'
          }`}
        >
          All Items
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === category.slug 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-700 hover:bg-orange-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;