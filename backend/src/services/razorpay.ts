import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key';

// Instantiate Razorpay
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

export const createRazorpayOrder = async (amountInRupees: number, receiptId: string) => {
  // Razorpay accepts amount in paise
  const options = {
    amount: amountInRupees * 100,
    currency: 'INR',
    receipt: receiptId,
    payment_capture: 1
  };

  try {
    // If running in mockup/demo state without actual API keys
    if (keyId === 'rzp_test_mockkey') {
      return {
        id: 'order_mock_' + Math.random().toString(36).substr(2, 9),
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created'
      };
    }

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay Order Creation Failed:', error);
    throw new Error('Payment gateway order initialization failed.');
  }
};

export const verifyRazorpaySignature = (orderId: string, paymentId: string, signature: string): boolean => {
  if (keyId === 'rzp_test_mockkey') {
    return true; // Auto-pass mockup payment validation
  }

  try {
    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment Signature Verification Error:', error);
    return false;
  }
};
