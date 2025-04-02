const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

// Helper function to format artisan data
const formatArtisanData = (artisan) => {
  const data = artisan.toJSON();
  // Convert specialties string to array if it exists
  if (data.specialties) {
    data.specialties = data.specialties.split(',').map(s => s.trim()).filter(s => s);
  }
  return data;
};

// Get all artisans (public route)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all artisans...');
    const artisans = await User.findAll({
      where: { role: 'artisan', isActive: true },
      attributes: ['id', 'name', 'email', 'role', 'bio', 'location', 'specialties', 'experience', 'imageUrl', 'isActive']
    });
    console.log(`Found ${artisans.length} artisans`);
    const formattedArtisans = artisans.map(formatArtisanData);
    res.json(formattedArtisans);
  } catch (error) {
    console.error('Error fetching artisans:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single artisan (public route)
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching artisan with ID:', req.params.id);
    const artisan = await User.findOne({
      where: { id: req.params.id, role: 'artisan', isActive: true },
      attributes: ['id', 'name', 'email', 'role', 'bio', 'location', 'specialties', 'experience', 'imageUrl', 'isActive']
    });
    if (!artisan) {
      console.log('Artisan not found');
      return res.status(404).json({ message: 'Artisan not found' });
    }
    console.log('Found artisan:', artisan.toJSON());
    const formattedArtisan = formatArtisanData(artisan);
    res.json(formattedArtisan);
  } catch (error) {
    console.error('Error fetching artisan:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get artisan's products (public route)
router.get('/:id/products', async (req, res) => {
  try {
    console.log('Fetching products for artisan ID:', req.params.id);
    const products = await Product.findAll({
      where: { artisanId: req.params.id, isActive: true }
    });
    console.log(`Found ${products.length} products for artisan`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching artisan products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update artisan profile (protected route)
router.put('/:id',
  authenticateToken,
  [
    body('name').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('bio').optional().trim(),
    body('location').optional().trim(),
    body('specialties').optional().trim(),
    body('experience').optional().trim(),
    body('imageUrl').optional().trim(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      console.log('Updating artisan profile for ID:', req.params.id);
      console.log('Request body:', req.body);
      console.log('User from token:', req.user);
      console.log('Image URL from request:', req.body.imageUrl);

      const artisan = await User.findOne({
        where: { id: req.params.id, role: 'artisan' }
      });

      if (!artisan) {
        console.log('Artisan not found');
        return res.status(404).json({ message: 'Artisan not found' });
      }

      // Check if user owns this profile
      if (artisan.id !== req.user.id) {
        console.log('Unauthorized update attempt');
        return res.status(403).json({ message: 'Not authorized to update this profile' });
      }

      // Update only the fields that are provided
      const updateData = {};
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      });

      console.log('Updating with data:', updateData);
      await artisan.update(updateData);
      
      // Fetch the updated artisan to confirm changes
      const updatedArtisan = await User.findOne({
        where: { id: req.params.id },
        attributes: ['id', 'name', 'email', 'role', 'bio', 'location', 'specialties', 'experience', 'imageUrl', 'isActive']
      });
      
      console.log('Profile updated successfully');
      const formattedArtisan = formatArtisanData(updatedArtisan);
      console.log('Updated artisan data:', formattedArtisan);
      res.json(formattedArtisan);
    } catch (error) {
      console.error('Error updating artisan profile:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router; 