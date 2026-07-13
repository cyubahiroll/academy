import { useState, useEffect, useRef, useCallback } from 'react';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import { FiX, FiSmartphone, FiBookOpen, FiCheckCircle, FiAlertCircle, FiLoader, FiDownload } from 'react-icons/fi';

const POLL_INTERVAL = 3000;
const MAX_POLLS = 30;

export default function PaymentModal({ isOpen, onClose, book, onPaymentSuccess }) {
  const [step, setStep] = useState('form');
  const [countryCode] = useState('+250');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const pollCountRef = useRef(0);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setPhoneNumber('');
      setPaymentStatus(null);
      setError('');
      setMessage('');
      setLoading(false);
      pollCountRef.current = 0;
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [isOpen]);

  const pollStatus = useCallback(async (referenceId) => {
    if (pollCountRef.current >= MAX_POLLS) {
      setPaymentStatus('FAILED');
      setStep('result');
      setMessage('Payment status check timed out. Please contact support.');
      toast.error('Payment status check timed out.');
      return;
    }

    try {
      const result = await paymentService.checkBookPaymentStatus(referenceId);
      setPaymentStatus(result.status);

      if (result.status === 'SUCCESSFUL') {
        setStep('result');
        setMessage('Payment successful. Your download is now available.');
        toast.success('Payment successful!');
        if (onPaymentSuccess) onPaymentSuccess();
        return;
      }

      if (result.status === 'FAILED') {
        setStep('result');
        setMessage('Payment failed. Please try again.');
        toast.error('Payment failed.');
        return;
      }

      pollCountRef.current += 1;
      pollTimerRef.current = setTimeout(() => pollStatus(referenceId), POLL_INTERVAL);
    } catch {
      pollCountRef.current += 1;
      pollTimerRef.current = setTimeout(() => pollStatus(referenceId), POLL_INTERVAL);
    }
  }, [onPaymentSuccess]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const handlePayNow = async () => {
    if (!phoneNumber.trim()) {
      setError('Enter your phone number');
      return;
    }
    if (phoneNumber.trim().length < 8) {
      setError('Enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);
    setStep('sending');

    try {
      const result = await paymentService.requestBookPayment({
        book_id: book.id,
        phone_number: phoneNumber.trim(),
        amount: 3000
      });

      if (result.access) {
        setStep('result');
        setMessage('You already own this book.');
        setPaymentStatus('SUCCESSFUL');
        toast.success('You already own this book.');
        if (onPaymentSuccess) onPaymentSuccess();
        return;
      }

      setStep('approve');

      pollCountRef.current = 0;
      pollTimerRef.current = setTimeout(() => pollStatus(result.referenceId), POLL_INTERVAL);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment request failed');
      setStep('form');
      toast.error(err.response?.data?.message || 'Payment request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    onClose();
  };

  const handleRetry = () => {
    setStep('form');
    setPaymentStatus(null);
    setError('');
    setMessage('');
    pollCountRef.current = 0;
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 overflow-y-auto py-4 sm:py-0">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiSmartphone className="text-amber-600" size={20} />
            {step === 'form' ? 'Pay to Download' : 'Payment'}
          </h3>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 pb-3 border-b dark:border-gray-700">
            <FiBookOpen className="shrink-0 text-amber-600 mt-1" size={22} />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight truncate">{book?.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Pay to download and keep this book</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-1">3,000 RWF</p>
            </div>
          </div>

          {step === 'form' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country Code</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-lg">🇷🇼</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">+250 Rwanda</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <div className="flex gap-2">
                  <div className="shrink-0 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm">
                    +250
                  </div>
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="78XXXXXXXX"
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-gray-100 dark:bg-gray-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method</label>
                <div className="p-3 rounded-lg border border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked readOnly className="accent-amber-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">MTN Rwanda Mobile Money</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pay using MTN Mobile Money</p>
                    </div>
                    <FiSmartphone className="text-gray-400 shrink-0" size={18} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Airtel Money coming soon</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button onClick={handlePayNow} disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <FiDownload size={18} /> Pay Now - 3,000 RWF
              </button>
            </>
          )}

          {step === 'sending' && (
            <div className="text-center py-8 space-y-4">
              <FiLoader className="animate-spin mx-auto text-amber-600" size={40} />
              <p className="text-gray-900 dark:text-gray-100 font-semibold">Sending payment request...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we contact MTN Mobile Money.</p>
            </div>
          )}

          {step === 'approve' && (
            <div className="text-center py-6 space-y-4">
              <FiSmartphone className="animate-pulse mx-auto text-green-600" size={40} />
              <p className="text-gray-900 dark:text-gray-100 font-semibold">Please approve the payment request on your phone.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A payment of <strong>3,000 RWF</strong> has been sent to <strong>{countryCode} {phoneNumber}</strong>.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Instructions:</p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Check your phone for an MTN Mobile Money prompt.</li>
                  <li>Enter your Mobile Money PIN on your phone to confirm.</li>
                  <li>This page will update automatically once confirmed.</li>
                </ol>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FiLoader className="animate-spin" size={14} />
                <span>Checking payment status...</span>
              </div>
              <p className="text-xs text-red-500 font-medium">
                Never share your PIN. We will never ask for your PIN.
              </p>
            </div>
          )}

          {step === 'result' && (
            <div className="text-center py-8 space-y-4">
              {paymentStatus === 'SUCCESSFUL' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
                    <FiCheckCircle className="text-green-600 dark:text-green-400" size={32} />
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Payment Successful!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{message || 'Your download is now available.'}</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto">
                    <FiAlertCircle className="text-red-600 dark:text-red-400" size={32} />
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Payment Failed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{message || 'The payment was not completed.'}</p>
                  <button onClick={handleRetry}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors">
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
