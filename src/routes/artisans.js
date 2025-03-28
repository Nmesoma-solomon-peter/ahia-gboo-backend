const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get all artisans
router.get('/', async (req, res) => {
  try {
    const artisans = await User.findAll({
      where: { role: 'artisan', isActive: true },
      attributes: { exclude: ['password'] }
    });
    res.json(artisans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single artisan
router.get('/:id', async (req, res) => {
  try {
    const artisan = await User.findOne({
      where: { id: req.params.id, role: 'artisan', isActive: true },
      attributes: { exclude: ['password'] }
    });
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    res.json(artisan);
  } catch (error) {
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
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const artisan = await User.findOne({
        where: { id: req.params.id, role: 'artisan' }
      });
      if (!artisan) {
        return res.status(404).json({ message: 'Artisan not found' });
      }

      // Check if user owns this profile
      if (artisan.id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this profile' });
      }

      await artisan.update(req.body);
      res.json(artisan);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router; 