const express = require('express');
const { body } = require('express-validator');
const Product = require('../models/Product');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, artisanId, search } = req.query;
    const where = { isActive: true };

    if (category) where.category = category;
    if (artisanId) where.artisanId = artisanId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('Fetching products with filters:', where);
    const products = await Product.findAll({ where });
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    console.log('Looking for product with ID:', req.params.id);
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        isActive: true
      }
    });

    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product found:', product.toJSON());
    res.json(product);
  } catch (error) {
    console.error('Error finding product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create product (protected route)
router.post('/',
  authenticateToken,
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('category').notEmpty().trim(),
    body('imageUrl').isURL(),
    body('culturalSignificance').optional().trim(),
    body('materials').optional().trim(),
    body('stock').isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      console.log('Creating new product with data:', req.body);
      const product = await Product.create({
        ...req.body,
        artisanId: req.user.id
      });
      console.log('Product created successfully:', product.toJSON());
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Update product (protected route)
router.put('/:id',
  authenticateToken,
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().trim(),
    body('imageUrl').optional().isURL(),
    body('culturalSignificance').optional().trim(),
    body('materials').optional().trim(),
    body('stock').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      console.log('Updating product with ID:', req.params.id);
      console.log('Update data:', req.body);

      const product = await Product.findByPk(req.params.id);
      if (!product) {
        console.log('Product not found with ID:', req.params.id);
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if user owns this product
      if (product.artisanId !== req.user.id) {
        console.log('Unauthorized update attempt by user:', req.user.id);
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }

      await product.update(req.body);
      console.log('Product updated successfully:', product.toJSON());
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete product (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Deleting product with ID:', req.params.id);
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.artisanId !== req.user.id) {
      console.log('Unauthorized delete attempt by user:', req.user.id);
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.destroy();
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 