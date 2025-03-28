const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Get all orders (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order (protected route)
router.post('/',
  authenticateToken,
  [
    body('items').isArray(),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shippingAddress').notEmpty().trim(),
    body('paymentMethod').notEmpty().trim()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const order = await Order.create({
        ...req.body,
        userId: req.user.id,
        status: 'pending'
      });
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update order status (protected route - admin only)
router.put('/:id/status',
  authenticateToken,
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.update({ status: req.body.status });
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router; 