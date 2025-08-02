const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const expressValidator = require('express-validator');
require('dotenv').config();
// import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/order');
const Product = require("./models/product")
const Category = require("./models/category")

// app
const app = express();

// db connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGOURI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    );
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    // exit process with failure
    process.exit(1);
  }
};
connectDB();

// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', orderRoutes);

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const insertData = async () => {
  try {
    // Insert Categories
    const categoriesData = [
      { name: 'Category 1' },
      { name: 'Category 2' },
      // Add more categories as needed
    ];
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log('Inserted Categories:', insertedCategories);

    // Insert Products referencing categories
    const productsData = [
      {
        name: 'Product 1',
        description: 'Description for Product 1',
        price: 50,
        category: insertedCategories[0]._id, // Use the ID of the first category
        quantity: 10,
        shipping: true,
      },
      {
        name: 'Product 2',
        description: 'Description for Product 2',
        price: 75,
        category: insertedCategories[1]._id, // Use the ID of the second category
        quantity: 20,
        shipping: false,
      },
      // Add more products as needed
    ];
    const insertedProducts = await Product.insertMany(productsData);
    console.log('Inserted Products:', insertedProducts);
  } catch (error) {
    console.error('Error inserting data:', error);
  }
};
//insertData();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
