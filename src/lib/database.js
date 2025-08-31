import { supabase } from './supabase';

export const initializeDatabase = async () => {
  console.log('Initializing database...');
  
  try {
    // Skip the table creation attempts since they're failing with 404
    // and the tables seem to already exist (based on the duplicate key errors)
    console.log('Skipping table creation, tables appear to exist already');
    
    // Create categories
    const categories = [
      { name: 'Cafe Items', slug: 'cafe', description: 'Coffee, pastries, and light snacks' },
      { name: 'Indian Dishes', slug: 'indian', description: 'Traditional Indian cuisine' },
      { name: 'South Indian', slug: 'south-indian', description: 'Authentic South Indian specialties' }
    ];
    
    // Insert categories - use upsert instead of insert to handle existing records
    for (const category of categories) {
      try {
        // Use upsert to update if exists, insert if not
        const { error: upsertError } = await supabase
          .from('categories')
          .upsert([{ 
            name: category.name, 
            slug: category.slug,
            description: category.description
          }], { 
            onConflict: 'slug',
            ignoreDuplicates: false
          });
          
        if (upsertError) {
          console.log(`Could not upsert category ${category.name}: ${upsertError.message}`);
        } else {
          console.log(`Upserted category: ${category.name}`);
        }
      } catch (err) {
        console.error(`Error processing category ${category.name}:`, err);
      }
    }
    
    // Sample menu items
    const menuItems = [
      // Cafe Items
      {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        price: 4.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Chocolate Croissant',
        description: 'Buttery croissant filled with chocolate',
        price: 3.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Espresso',
        description: 'Strong concentrated coffee served in a small cup',
        price: 3.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Latte',
        description: 'Espresso with steamed milk and a light layer of foam',
        price: 4.79,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Americano',
        description: 'Espresso diluted with hot water',
        price: 3.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Mocha',
        description: 'Espresso with chocolate and steamed milk',
        price: 5.29,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc39?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Chai Latte',
        description: 'Spiced tea with steamed milk',
        price: 4.89,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1529474944862-30e695621eac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Hot Chocolate',
        description: 'Rich chocolate melted into steamed milk',
        price: 4.59,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Matcha Latte',
        description: 'Japanese green tea powder whisked with steamed milk',
        price: 5.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Almond Croissant',
        description: 'Flaky croissant filled with almond cream',
        price: 4.29,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1623334044303-241021148842?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Plain Croissant',
        description: 'Classic buttery French pastry',
        price: 3.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Blueberry Muffin',
        description: 'Moist muffin packed with fresh blueberries',
        price: 3.79,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      // {
      //   name: 'Baingan Bharta',
      //   description: 'Baingan Bharta with spices',
      //   price: 3.79,
      //   category: 'cafe',
      //   image_url: 'https://www.cookwithmanali.com/wp-content/uploads/2014/08/Baingan-Bharta-500x500.jpg',
      //   vegetarian: true
      // },
      {
        name: 'Cinnamon Roll',
        description: 'Soft roll with cinnamon swirl and cream cheese frosting',
        price: 4.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Bagel with Cream Cheese',
        description: 'Toasted bagel served with whipped cream cheese',
        price: 3.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1592845345886-b2915e4ecf0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Avocado Toast',
        description: 'Multigrain toast topped with mashed avocado and seasonings',
        price: 7.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1603046891744-76e6300f82ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Egg & Cheese Sandwich',
        description: 'Fried egg with cheddar on a toasted English muffin',
        price: 5.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Fruit Parfait',
        description: 'Layers of yogurt, granola, and fresh seasonal fruits',
        price: 6.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Fruit Smoothie',
        description: 'Blended fresh fruits with yogurt and honey',
        price: 5.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Green Smoothie',
        description: 'Spinach, kale, banana, and almond milk blend',
        price: 6.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Chocolate Chip Cookie',
        description: 'Freshly baked cookie with chocolate chunks',
        price: 2.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Oatmeal Raisin Cookie',
        description: 'Chewy cookie with oats and plump raisins',
        price: 2.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Brownie',
        description: 'Rich chocolate brownie with walnuts',
        price: 3.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Carrot Cake',
        description: 'Spiced cake with carrots and cream cheese frosting',
        price: 5.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1622926421334-6ac6c512dccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Lemon Pound Cake',
        description: 'Buttery cake with lemon glaze',
        price: 4.29,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Biscotti',
        description: 'Twice-baked Italian almond cookie',
        price: 2.49,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1619021016992-05c0dd7a9065?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Macaron',
        description: 'French almond meringue cookie with ganache filling',
        price: 2.99,
        category: 'cafe',
        image_url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      
      // Indian Dishes
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in a rich tomato and butter sauce',
        price: 14.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Paneer Tikka Masala',
        description: 'Cottage cheese cubes in a spiced tomato gravy',
        price: 13.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Chicken Tikka Masala',
        description: 'Grilled chicken pieces in a creamy spiced curry sauce',
        price: 15.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1565980452496-ad7514b93ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Chicken Biryani',
        description: 'Fragrant basmati rice cooked with spiced chicken and herbs',
        price: 16.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Vegetable Biryani',
        description: 'Aromatic rice dish with mixed vegetables and spices',
        price: 14.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Lamb Rogan Josh',
        description: 'Tender lamb cooked in a rich Kashmiri spice blend',
        price: 17.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356cf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Chana Masala',
        description: 'Chickpeas simmered in a spicy tomato gravy',
        price: 12.99,
        category: 'indian',
        image_url: 'https://minimalistbaker.com/wp-content/uploads/2016/02/EASY-Chana-Masala-SQUARE.jpg',
        vegetarian: true
      },
      {
        name: 'Dal Makhani',
        description: 'Black lentils and kidney beans in a creamy buttery sauce',
        price: 13.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1599042891164-e71d4baecd7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Palak Paneer',
        description: 'Cottage cheese cubes in a creamy spinach sauce',
        price: 14.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Aloo Gobi',
        description: 'Potatoes and cauliflower cooked with Indian spices',
        price: 12.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Malai Kofta',
        description: 'Fried vegetable and cheese dumplings in a creamy sauce',
        price: 14.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a254b3f49?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Tandoori Chicken',
        description: 'Chicken marinated in yogurt and spices, roasted in a clay oven',
        price: 15.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Chicken Korma',
        description: 'Chicken in a mild, creamy sauce with nuts and spices',
        price: 15.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Lamb Vindaloo',
        description: 'Spicy curry with tender lamb in a tangy sauce',
        price: 17.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1574484184081-afcb215efe58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Vegetable Jalfrezi',
        description: 'Mixed vegetables in a spicy tomato-based sauce',
        price: 13.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Baingan Bharta',
        description: 'Smoky roasted eggplant mash with spices',
        price: 13.49,
        category: 'indian',
        image_url: 'https://www.cookwithmanali.com/wp-content/uploads/2014/08/Baingan-Bharta-500x500.jpg',
        vegetarian: true
      },
      {
        name: 'Saag Chicken',
        description: 'Chicken cooked in a creamy spinach sauce',
        price: 15.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Keema Matar',
        description: 'Minced lamb cooked with peas and spices',
        price: 16.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Mutter Paneer',
        description: 'Green peas and cottage cheese cubes in a tomato gravy',
        price: 13.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Chicken Curry',
        description: 'Classic chicken curry with onions, tomatoes, and spices',
        price: 14.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Fish Curry',
        description: 'Fish fillets simmered in a tangy coconut curry',
        price: 16.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Prawn Masala',
        description: 'Prawns cooked in a spicy tomato-based sauce',
        price: 17.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1627308595652-1aa03c90507c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Kadai Paneer',
        description: 'Cottage cheese with bell peppers in a spicy gravy',
        price: 14.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1594020931334-1a516accab10?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Vegetable Samosas',
        description: 'Crispy pastry filled with spiced potatoes and peas',
        price: 6.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Onion Bhaji',
        description: 'Crispy onion fritters with chickpea flour',
        price: 5.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1622542796254-5b9c46a259b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Chicken Pakora',
        description: 'Spiced chicken fritters with chickpea flour coating',
        price: 8.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: false
      },
      {
        name: 'Garlic Naan',
        description: 'Soft flatbread with garlic and butter',
        price: 3.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Butter Naan',
        description: 'Soft flatbread brushed with melted butter',
        price: 3.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Cheese Naan',
        description: 'Naan stuffed with melted cheese',
        price: 4.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Roti',
        description: 'Whole wheat flatbread',
        price: 2.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Jeera Rice',
        description: 'Basmati rice flavored with cumin seeds',
        price: 4.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1596797038530-2c107aa8e1fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Pulao',
        description: 'Fragrant rice with vegetables and mild spices',
        price: 5.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1617692855027-33b14f061079?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Raita',
        description: 'Yogurt with cucumber and mild spices',
        price: 3.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1589516412324-1a8107b1c116?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Mango Chutney',
        description: 'Sweet and tangy mango condiment',
        price: 2.99,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1519070846755-46e28dea0f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Papadum',
        description: 'Crispy lentil wafers',
        price: 2.49,
        category: 'indian',
        image_url: 'https://images.unsplash.com/photo-1599487489738-f5160da7abfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      
      // South Indian Dishes
      {
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potatoes',
        price: 12.99,
        category: 'south-indian',
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Idli Sambar',
        description: 'Steamed rice cakes served with lentil soup and chutney',
        price: 10.99,
        category: 'south-indian',
        image_url: 'https://images.unsplash.com/photo-1626108870265-123cae36ec2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      },
      {
        name: 'Uttapam',
        description: 'Thick rice pancake topped with vegetables',
        price: 11.99,
        category: 'south-indian',
        image_url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        vegetarian: true
      }
    ];
    
    // After upserting categories, fetch them to get their IDs
    const { data: categoryRows, error: fetchCatError } = await supabase
      .from('categories')
      .select('id, slug');
    if (fetchCatError) {
      console.error('Error fetching categories:', fetchCatError.message);
      return;
    }
    const slugToId = {};
    categoryRows.forEach(cat => {
      slugToId[cat.slug] = cat.id;
    });

    // Insert menu items - use upsert instead of insert to handle existing records
    for (const item of menuItems) {
      try {
        const categoryId = slugToId[item.category];
        if (!categoryId) {
          console.error(`Category not found for slug: ${item.category}`);
          continue;
        }
        // Use upsert to update if exists, insert if not
        const { error: upsertError } = await supabase
          .from('menu_items')
          .upsert([{ 
            name: item.name, 
            description: item.description,
            price: item.price,
            category_id: categoryId,
            image_url: item.image_url,
            vegetarian: item.vegetarian
          }], { 
            onConflict: 'name',
            ignoreDuplicates: false
          });
          
        if (upsertError) {
          console.log(`Could not upsert menu item ${item.name}: ${upsertError.message}`);
        } else {
          console.log(`Upserted menu item: ${item.name}`);
        }
      } catch (err) {
        console.error(`Error processing menu item ${item.name}:`, err);
      }
    }
    
    // Insert menu items - use the category slug directly
    for (const item of menuItems) {
      try {
        // Use upsert to update if exists, insert if not
        const { error: upsertError } = await supabase
          .from('menu_items')
          .upsert([{ 
            name: item.name, 
            description: item.description,
            price: item.price,
            category: item.category, // Use category slug directly
            image_url: item.image_url,
            vegetarian: item.vegetarian
          }], { 
            onConflict: 'name',
            ignoreDuplicates: false
          });
          
        if (upsertError) {
          console.log(`Could not upsert menu item ${item.name}: ${upsertError.message}`);
        } else {
          console.log(`Upserted menu item: ${item.name}`);
        }
      } catch (err) {
        console.error(`Error processing menu item ${item.name}:`, err);
      }
    }
    
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
// Fetch popular menu items from Supabase
export const getPopularItems = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_popular', true)
    .eq('is_available', true);

  if (error) {
    throw error;
  }
  return data;
};