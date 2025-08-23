const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Queue = require('../models/Queue');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Queue.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@college.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      studentId: 'ADMIN001',
      department: 'Administration'
    });

    console.log('Created admin user:', adminUser.email);

    // Create sample student user
    const studentPassword = await bcrypt.hash('student123', 10);
    const studentUser = await User.create({
      email: 'student@college.com',
      password: studentPassword,
      name: 'Sample Student',
      role: 'student',
      studentId: 'STU001',
      department: 'Computer Science'
    });

    console.log('Created sample student:', studentUser.email);

    // Create sample menu items for canteen
    const sampleMenuItems = [
      {
        name: 'Veg Biryani',
        description: 'Fragrant basmati rice cooked with aromatic spices and mixed vegetables',
        price: 80,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d8a9?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Chicken Curry',
        description: 'Tender chicken pieces in rich, spicy curry sauce',
        price: 120,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes in rich, creamy tomato gravy',
        price: 100,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Masala Dosa',
        description: 'Crispy dosa filled with spiced potato mixture',
        price: 60,
        category: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Idli Sambar',
        description: 'Soft steamed rice cakes served with lentil soup',
        price: 40,
        category: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Tea',
        description: 'Hot masala chai',
        price: 15,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Coffee',
        description: 'Strong filter coffee',
        price: 20,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes and peas',
        price: 20,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Vada Pav',
        description: 'Spicy potato fritter in a soft bun',
        price: 25,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'French Fries',
        description: 'Crispy golden potato fries',
        price: 50,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Chocolate Shake',
        description: 'Rich and creamy chocolate milkshake',
        price: 80,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      },
      {
        name: 'Gulab Jamun',
        description: 'Sweet milk solids in sugar syrup',
        price: 30,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&fit=crop',
        available: true,
        serviceType: 'canteen'
      }
    ];

    const createdMenuItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    // Create sample queues
    const sampleQueues = [
      {
        name: 'Canteen Queue',
        serviceType: 'canteen',
        currentNumber: 0,
        customers: [],
        status: 'active',
        maxCapacity: 100,
        estimatedWaitTime: 15
      },
      {
        name: 'Xerox Queue',
        serviceType: 'xerox',
        currentNumber: 0,
        customers: [],
        status: 'active',
        maxCapacity: 50,
        estimatedWaitTime: 10
      }
    ];

    const createdQueues = await Queue.insertMany(sampleQueues);
    console.log(`Created ${createdQueues.length} queues`);

    console.log('Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@college.com / admin123');
    console.log('Student: student@college.com / student123');

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

module.exports = seedDatabase;
