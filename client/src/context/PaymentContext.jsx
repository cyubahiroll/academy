import { createContext, useState, useContext } from 'react';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (plan, paymentMethod, transactionId) => {
    setLoading(true);
    try {
      const result = await paymentService.create({
        plan,
        payment_method: paymentMethod,
        transaction_id: transactionId
      });
      toast.success('Payment initiated!');
      return result;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentId, transactionId) => {
    setLoading(true);
    try {
      const result = await paymentService.confirm(paymentId, transactionId);
      await checkSubscription();
      toast.success('Payment confirmed!');
      return result;
    } catch (error) {
      toast.error('Payment confirmation failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const result = await paymentService.getSubscription();
      setSubscription(result);
      return result;
    } catch {
      setSubscription(null);
      return null;
    }
  };

  const cancelSubscription = async () => {
    try {
      await paymentService.cancelSubscription();
      setSubscription(null);
      toast.success('Subscription cancelled');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  return (
    <PaymentContext.Provider value={{
      subscription,
      loading,
      initiatePayment,
      confirmPayment,
      checkSubscription,
      cancelSubscription,
      hasActiveSubscription: subscription?.active === true
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
