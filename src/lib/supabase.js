import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with valid URL and key
const supabaseUrl = 'https://qurdqylhjdlbxhnxhdee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cmRxeWxoamRsYnhobnhoZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjI3NTUsImV4cCI6MjA3MjE5ODc1NX0.Y3Oo216un6pKOFWTQBHQr5h-OZFpcQsAJMkRiGMTNBY';

// Create client with explicit session persistence configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,  // Use localStorage for session persistence
    autoRefreshToken: true, // Auto refresh tokens
    persistSession: true,   // Persist session in local storage
    detectSessionInUrl: true, // Detect session from URL params
  },
});

// Database schema setup function - simplified to check for tables instead of using RPC
export const setupDatabase = async () => {
  console.log('Checking database tables...');
  
  try {
    // Instead of trying to create tables via RPC, we'll check if they exist
    // and provide guidance on how to create them
    
    // Check if categories table exists
    const { error: categoriesError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (categoriesError) {
      console.log('Categories table does not exist or is not accessible');
    } else {
      console.log('Categories table exists');
    }
    
    // Check if menu_items table exists
    const { error: menuItemsError } = await supabase
      .from('menu_items')
      .select('count')
      .limit(1);
    
    if (menuItemsError) {
      console.log('Menu items table does not exist or is not accessible');
    } else {
      console.log('Menu items table exists');
    }
    
    console.log('Database check complete');
  } catch (error) {
    console.error('Error checking database:', error);
  }
};

// Sample data insertion - simplified to handle errors better
export const insertSampleData = async () => {
  try {
    // Check if categories table exists and has data
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('count');
    
    if (checkError) {
      console.log('Cannot access categories table. You may need to create it first.');
      console.log('Please run the SQL setup script in the Supabase dashboard.');
      return;
    }
    
    // If we already have data, don't insert again
    if (existingCategories && existingCategories.length > 0 && existingCategories[0].count > 0) {
      console.log('Data already exists, skipping insertion');
      return;
    }
    
    // Insert categories
    const categories = [
      { name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3' },
      { name: 'Pizza', image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3' },
      { name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3' },
      { name: 'Drinks', image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3' },
    ];
    
    const { error: categoriesError } = await supabase.from('categories').insert(categories);
    if (categoriesError) {
      console.error('Error inserting categories:', categoriesError);
      return;
    }
    
    // Get category IDs
    const { data: categoryData, error: fetchError } = await supabase.from('categories').select('*');
    
    if (fetchError || !categoryData) {
      console.error('Error fetching categories:', fetchError);
      return;
    }
    
    const categoryMap = {};
    categoryData.forEach(category => {
      categoryMap[category.name] = category.id;
    });
    
    // Insert menu items
    const menuItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: 9.99,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3',
        category_id: categoryMap['Burgers'],
        is_popular: true,
        is_available: true
      },
      {
        name: 'Cheeseburger',
        description: 'Classic burger with melted cheddar cheese',
        price: 10.99,
        image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3',
        category_id: categoryMap['Burgers'],
        is_popular: false,
        is_available: true
      },
      {
        name: 'Margherita Pizza',
        description: 'Traditional pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3',
        category_id: categoryMap['Pizza'],
        is_popular: true,
        is_available: true
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pizza topped with pepperoni slices',
        price: 13.99,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3',
        category_id: categoryMap['Pizza'],
        is_popular: false,
        is_available: true
      },
      {
        name: 'Chocolate Brownie',
        description: 'Rich chocolate brownie with vanilla ice cream',
        price: 5.99,
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3',
        category_id: categoryMap['Desserts'],
        is_popular: true,
        is_available: true
      },
      {
        name: 'Cheesecake',
        description: 'Creamy New York style cheesecake with berry compote',
        price: 6.99,
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-4.0.3',
        category_id: categoryMap['Desserts'],
        is_popular: false,
        is_available: true
      },
      {
        name: 'Fresh Fruit Smoothie',
        description: 'Blend of seasonal fruits with yogurt and honey',
        price: 4.99,
        image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3',
        category_id: categoryMap['Drinks'],
        is_popular: true,
        is_available: true
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brewed coffee served over ice with cream',
        price: 3.99,
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-4.0.3',
        category_id: categoryMap['Drinks'],
        is_popular: false,
        is_available: true
      }
    ];
    
    const { error: menuItemsError } = await supabase.from('menu_items').insert(menuItems);
    if (menuItemsError) {
      console.error('Error inserting menu items:', menuItemsError);
      return;
    }
    
    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error in sample data insertion:', error);
  }
};
