require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const {sequelize,Restaurant,MenuItem}=require('./models');
const restaurantData=require('./data/restaurants.json');

const app=express();
app.use(cors());
app.use(bodyParser.json());
let isReady = false;

// Middleware to check if DB is ready
app.use((req, res, next) => {
  if (req.path === '/healthz') return next();
  if (!isReady) return res.status(503).json({ error: 'Service unavailable, initializing...' });
  next();
});

app.use('/api/auth',require('./routes/auth'));
app.use('/api/restaurants',require('./routes/restaurants'));
app.use('/api/orders',require('./routes/orders'));
app.use('/api/chat',require('./routes/chat'));
app.get('/healthz',(req,res)=>res.json({status:'ok'}));

async function init(){
  try {
    await sequelize.sync({alter:true});
    
    // Force re-seed if data is missing or to update with new fields
    // For development/demo, we'll check if the first restaurant has an image. If not, we re-seed.
    const firstRestaurant = await Restaurant.findOne();
    const shouldSeed = !firstRestaurant || !firstRestaurant.image;

    if(shouldSeed){
      console.log('🔄 Re-seeding database with new data...');
      // Clear existing data
      await MenuItem.destroy({where:{}, truncate:true});
      await Restaurant.destroy({where:{}, truncate:true, cascade: true});

      // Seed from JSON file
      for(const restaurantInfo of restaurantData.restaurants){
        const restaurant = await Restaurant.create({
          name: restaurantInfo.name,
          cuisine: restaurantInfo.cuisine,
          rating: restaurantInfo.rating,
          location: restaurantInfo.location,
          image: restaurantInfo.image,
          deliveryTime: restaurantInfo.deliveryTime
        });
        
        // Create menu items for this restaurant
        const menuItems = restaurantInfo.menu.map(item => ({
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          category: item.category,
          RestaurantId: restaurant.id
        }));
        
        await MenuItem.bulkCreate(menuItems);
      }
      console.log(`✅ Seeded ${restaurantData.restaurants.length} restaurants with menus`);
    }
    isReady = true;
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Start server immediately, then init DB
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  init();
});