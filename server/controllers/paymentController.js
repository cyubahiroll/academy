const SubscriptionPayment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const BookPaymentModel = require('../models/BookPaymentModel');
const PurchasedBook = require('../models/PurchasedBook');
const Document = require('../models/Document');
const { SUBSCRIPTION_PLANS, EXAM_PRICES } = require('../config/payment');
const mtnRwandaService = require('../services/mtnRwandaService');

exports.createPayment = async (req, res, next) => {
  try {
    const { plan, payment_method, transaction_id } = req.body;

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    const planData = SUBSCRIPTION_PLANS[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planData.duration);

    const subscriptionId = await Subscription.create({
      user_id: req.user.id,
      plan,
      status: 'pending',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      amount: planData.price
    });

    const paymentId = await SubscriptionPayment.create({
      user_id: req.user.id,
      subscription_id: subscriptionId,
      amount: planData.price,
      currency: planData.currency,
      payment_method,
      transaction_id,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Payment initiated',
      paymentId,
      subscriptionId,
      amount: planData.price,
      currency: planData.currency
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentId, transaction_id } = req.body;

    const payment = await SubscriptionPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await SubscriptionPayment.updateStatus(paymentId, 'completed', transaction_id);
    await Subscription.updateStatus(payment.subscription_id, 'active');

    res.json({ message: 'Payment confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await SubscriptionPayment.findByUser(req.user.id);
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await SubscriptionPayment.findAll(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findActiveByUser(req.user.id);
    if (!subscription) {
      return res.json({ active: false, message: 'No active subscription' });
    }
    res.json({
      active: true,
      plan: subscription.plan,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      days_remaining: Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findActiveByUser(req.user.id);
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    await Subscription.cancel(subscription.id);
    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
};

exports.requestBookPayment = async (req, res, next) => {
  try {
    const { book_id, phone_number, amount } = req.body;

    if (!book_id || !phone_number) {
      return res.status(400).json({ message: 'book_id and phone_number are required' });
    }

    const doc = await Document.findById(book_id);
    if (!doc) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const payAmount = amount || 3000;

    const existingPurchase = await PurchasedBook.findByUserAndBook(req.user.id, book_id);
    if (existingPurchase) {
      return res.json({ message: 'You already own this book', access: true, alreadyPurchased: true });
    }

    const sub = await Subscription.findActiveByUser(req.user.id);
    if (sub) {
      const paymentRecord = await BookPaymentModel.create({
        user_id: req.user.id,
        book_id,
        phone_number,
        country_code: '+250',
        amount: 0,
        currency: 'RWF',
        payment_provider: 'subscription',
        reference_id: 'SUBSCRIPTION'
      });
      await PurchasedBook.create({ user_id: req.user.id, book_id, payment_id: paymentRecord });
      return res.json({ message: 'You have access via subscription', access: true, subscription: true });
    }

    const formattedPhone = phone_number.startsWith('+250') ? phone_number : `+250${phone_number.replace(/^0+/, '')}`;

    const providerResult = await mtnRwandaService.requestToPay({
      phoneNumber: formattedPhone,
      amount: payAmount,
      externalId: `BOOK-${book_id}-${req.user.id}-${Date.now()}`
    });

    const paymentId = await BookPaymentModel.create({
      user_id: req.user.id,
      book_id,
      phone_number: formattedPhone,
      country_code: '+250',
      amount: payAmount,
      currency: 'RWF',
      payment_provider: 'mtn_rwanda',
      reference_id: providerResult.referenceId
    });

    res.status(201).json({
      message: 'Payment request sent. Please approve the payment request on your phone.',
      paymentId,
      referenceId: providerResult.referenceId
    });
  } catch (error) {
    next(error);
  }
};

exports.checkBookPaymentStatus = async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    const payment = await BookPaymentModel.findByReferenceId(referenceId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.payment_status === 'SUCCESSFUL') {
      const existingPurchase = await PurchasedBook.findByUserAndBook(req.user.id, payment.book_id);
      return res.json({
        status: 'SUCCESSFUL',
        message: 'Payment successful. Your download is now available.',
        access: !!existingPurchase
      });
    }

    const providerResult = await mtnRwandaService.getPaymentStatus(referenceId);

    if (providerResult.status !== payment.payment_status) {
      await BookPaymentModel.updateStatus(payment.id, providerResult.status, providerResult.financialTransactionId);
    }

    const isSuccessful = providerResult.status === 'SUCCESSFUL';

    if (isSuccessful) {
      await PurchasedBook.create({
        user_id: payment.user_id,
        book_id: payment.book_id,
        payment_id: payment.id
      });
    }

    res.json({
      status: providerResult.status,
      financialTransactionId: providerResult.financialTransactionId,
      message: isSuccessful
        ? 'Payment successful. Your download is now available.'
        : `Payment status: ${providerResult.status}`,
      access: isSuccessful
    });

    if (isSuccessful) {
      await mtnRwandaService.sendDeliveryNotification(referenceId).catch(() => {});
    }
  } catch (error) {
    next(error);
  }
};

exports.handleDeliveryNotification = async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    const payment = await BookPaymentModel.findByReferenceId(referenceId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.payment_status !== 'SUCCESSFUL') {
      return res.status(400).json({ message: 'Payment is not successful yet' });
    }

    await mtnRwandaService.sendDeliveryNotification(referenceId);

    res.json({ message: 'Delivery notification sent successfully' });
  } catch (error) {
    next(error);
  }
};
