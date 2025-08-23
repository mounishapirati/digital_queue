import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, QrCode, Clock } from 'lucide-react';
import FoodImage from '../components/ui/FoodImage';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Please log in to view your cart.');
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Cart functions are now provided by CartContext

    const handleCheckout = async () => {
         if (getCartItemCount() === 0) {
       alert('Your cart is empty');
       return;
     }

     // Validate cart items
     const cartItems = Object.values(cart);
     if (cartItems.length === 0) {
       alert('Your cart is empty. Please add some items first.');
       return;
     }

     // Check if all items have required fields
     const invalidItems = cartItems.filter(item => !item.id && !item._id);
     if (invalidItems.length > 0) {
       console.error('Invalid items found:', invalidItems);
       alert('Some items in your cart are invalid. Please refresh and try again.');
       return;
     }

     // Log cart data for debugging
     console.log('Cart items being submitted:', cartItems.map(item => ({
       id: item.id || item._id,
       name: item.name,
       quantity: item.quantity,
       price: item.price
     })));

    setLoading(true);
    
    try {
      // Validate required fields
      if (!paymentMethod) {
        alert('Please select a payment method');
        setLoading(false);
        return;
      }

             const orderData = {
         items: Object.values(cart).map(item => ({
           itemId: item.id || item._id,
           quantity: item.quantity,
           price: item.price,
           name: item.name,
           category: item.category
         })),
         total: getCartTotal(),
         serviceType: 'canteen',
         paymentMethod,
         specialInstructions: specialInstructions.trim() || undefined,
         status: 'pending'
       };

      console.log('Submitting order:', orderData);

             const token = localStorage.getItem('token');
       if (!token) {
         alert('❌ Please log in to place an order.');
         navigate('/login');
         setLoading(false);
         return;
       }

       // Debug: Log token info
       console.log('Token found:', !!token);
       console.log('Token length:', token?.length);
       console.log('Token preview:', token?.substring(0, 20) + '...');
       
       // Decode token to see payload (for debugging only)
       try {
         const tokenPayload = JSON.parse(atob(token.split('.')[1]));
         console.log('Token payload:', tokenPayload);
       } catch (e) {
         console.log('Could not decode token payload:', e.message);
       }

       const response = await fetch('/api/orders', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(orderData)
       });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

             if (response.ok) {
         // Show success message with better formatting
         const orderId = result.order?.id || result.order?._id || 'N/A';
         const successMessage = `🎉 Order Placed Successfully!

Order ID: ${orderId}
Total Amount: ₹${getCartTotal()}
Payment Method: ${paymentMethod === 'online' ? 'Online Payment' : 'Pay at Counter'}
Service Type: Canteen

Your order has been received and is being prepared. 
Please show your order ID at the counter for collection.

Estimated preparation time: 15-20 minutes

Thank you for using Digital Queue! 🚀`;

         // Show success message
         alert(successMessage);
         
         // Clear cart using context
         clearCart();
         
         // Redirect to order details or orders list
         if (result.order?.id || result.order?._id) {
           navigate(`/orders/${orderId}`);
         } else {
           navigate('/orders');
         }
       } else {
        // Handle different error types
        let errorMessage = 'Order failed. Please try again.';
        
        if (response.status === 401) {
          errorMessage = 'Please log in to place an order.';
          navigate('/login');
                 } else if (response.status === 400) {
           if (result.error && result.error.includes('validation')) {
             errorMessage = 'Please check your order details and try again.';
           } else if (result.error && result.error.includes('cart')) {
             errorMessage = 'Your cart seems to be empty or invalid. Please refresh and try again.';
           } else {
             errorMessage = result.error || 'Invalid order data. Please check your cart.';
           }
         } else if (response.status === 500) {
           errorMessage = 'Server error. Please try again later.';
         } else if (result.error) {
           errorMessage = result.error;
         }
        
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('❌ Network error. Please check your internet connection and try again.');
      } else {
        alert('❌ Checkout failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (getCartItemCount() === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items from our menu</p>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/menu')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600">{getCartItemCount()} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Debug Info - Remove this in production */}
         <div className="mb-6 p-4 bg-gray-100 rounded-lg text-xs">
           <div className="font-semibold mb-2">Debug Info:</div>
           <div>Cart Items: {Object.keys(cart).length}</div>
           <div>Total: ₹{getCartTotal()}</div>
           <div>Payment Method: {paymentMethod || 'Not selected'}</div>
           <div>User Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
           <div>Cart Data: {JSON.stringify(Object.values(cart).map(item => ({ id: item.id || item._id, name: item.name, quantity: item.quantity })))}</div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {Object.values(cart).map((item) => (
                                     <div key={item.id} className="px-6 py-4 flex items-center space-x-4">
                     <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                       <FoodImage item={item} className="w-16 h-16 object-cover" />
                     </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm font-medium text-gray-900">₹{item.price}</p>
                    </div>
                    
                                         <div className="flex items-center space-x-2">
                       <button
                         onClick={() => updateQuantity(item.id, item.quantity - 1)}
                         className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                       >
                         -
                       </button>
                       <span className="w-8 text-center text-sm font-medium text-gray-900">
                         {item.quantity}
                       </span>
                       <button
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                       >
                         +
                       </button>
                     </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{getCartTotal()}</span>
                  </div>
                </div>
              </div>

                             {/* Payment Method */}
               <div className="mb-6">
                 <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method *</h3>
                 <div className="space-y-3">
                   <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                     <input
                       type="radio"
                       name="paymentMethod"
                       value="online"
                       checked={paymentMethod === 'online'}
                       onChange={(e) => setPaymentMethod(e.target.value)}
                       className="mr-3 text-blue-600 focus:ring-blue-500"
                     />
                     <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                     <div>
                       <div className="font-medium text-gray-900">Online Payment</div>
                       <div className="text-sm text-gray-500">Pay securely with card/UPI</div>
                     </div>
                   </label>
                   <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer transition-colors">
                     <input
                       type="radio"
                       name="paymentMethod"
                       value="offline"
                       checked={paymentMethod === 'offline'}
                       onChange={(e) => setPaymentMethod(e.target.value)}
                       className="mr-3 text-green-600 focus:ring-green-500"
                     />
                     <QrCode className="h-5 w-5 mr-3 text-green-600" />
                     <div>
                       <div className="font-medium text-gray-900">Pay at Counter</div>
                       <div className="text-sm text-gray-500">Show QR code and pay at counter</div>
                     </div>
                   </label>
                 </div>
                 {!paymentMethod && (
                   <p className="text-sm text-red-600 mt-2">Please select a payment method</p>
                 )}
               </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests or dietary requirements..."
                />
              </div>

              {/* Important Notes */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Important Notes:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Orders are prepared fresh upon ordering</li>
                      <li>• Show QR code at counter for collection</li>
                      <li>• No delivery service available</li>
                      <li>• Estimated preparation time: 15-20 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>

                             <button
                 onClick={handleCheckout}
                 disabled={loading || getCartItemCount() === 0 || !paymentMethod}
                 className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
               >
                 {loading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     Processing Order...
                   </>
                 ) : (
                   `Place Order - ₹${getCartTotal()}`
                 )}
               </button>
               
               {!paymentMethod && (
                 <p className="text-sm text-red-600 text-center mt-2">
                   ⚠️ Please select a payment method to continue
                 </p>
               )}
               
               {loading && (
                 <p className="text-sm text-blue-600 text-center mt-2">
                   🔄 Please wait while we process your order...
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
