const express = require('express');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ available: true }).sort({ category: 1, name: 1 });
    res.json({ menuItems });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Failed to get menu' });
  }
});

// Get menu items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.find({ 
      category: { $regex: new RegExp(category, 'i') }, 
      available: true 
    }).sort({ name: 1 });

    res.json({ menuItems });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category items' });
  }
});

// Get specific menu item
router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const menuItem = await MenuItem.findById(itemId);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ menuItem });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Failed to get menu item' });
  }
});

// Get all categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Search menu items
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchResults = await MenuItem.find({
      $and: [
        { available: true },
        {
          $or: [
            { name: { $regex: new RegExp(query, 'i') } },
            { description: { $regex: new RegExp(query, 'i') } }
          ]
        }
      ]
    }).sort({ name: 1 });

    res.json({ menuItems: searchResults });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search menu' });
  }
});

// Get menu items by service type
router.get('/service/:serviceType', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const menuItems = await MenuItem.find({ 
      serviceType, 
      available: true 
    }).sort({ category: 1, name: 1 });

    res.json({ menuItems });
  } catch (error) {
    console.error('Get service menu error:', error);
    res.status(500).json({ error: 'Failed to get service menu' });
  }
});

module.exports = router;
