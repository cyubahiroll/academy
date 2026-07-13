const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    console.log(`[Contact] New message from ${name} (${email}): ${message.substring(0, 100)}`);
    res.json({ message: 'Message received. We will get back to you soon!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
