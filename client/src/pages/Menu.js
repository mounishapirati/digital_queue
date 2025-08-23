import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import FoodImage from '../components/ui/FoodImage';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();

  // Define filterItems function
  const filterItems = useCallback(() => {
    let filtered = menuItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery]);

  // Define other functions
  const fetchMenuItems = async () => {
    try {
      console.log('Fetching menu items...');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Try with token first, then without if it fails
      let response;
      if (token) {
        response = await fetch('/api/menu', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await fetch('/api/menu');
      }
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Fetched menu items:', data);
      
             if (data.menuItems && Array.isArray(data.menuItems)) {
         console.log('Setting menu items:', data.menuItems.length, 'items');
         console.log('First item structure:', data.menuItems[0]);
         setMenuItems(data.menuItems);
       } else {
         console.log('No menu items in response or invalid format');
         setMenuItems([]);
       }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Cart functions are now provided by CartContext

  // Load data on component mount
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  // Filter items when dependencies change
  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, searchQuery, filterItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canteen Menu</h1>
                <p className="text-gray-600">Order delicious food from our canteen</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Canteen Menu</h1>
              <p className="text-gray-600">Order delicious food from our canteen</p>
            </div>
                         <div className="relative flex items-center space-x-3">
               {getCartItemCount() > 0 && (
                 <button
                   onClick={clearCart}
                   className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                 >
                   Clear Cart
                 </button>
               )}
               <Link to="/cart" className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                 <ShoppingCart className="h-5 w-5 mr-2" />
                 Cart ({getCartItemCount()})
               </Link>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {/* Search and Filters */}
         <div className="mb-8 space-y-4">
           <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search for food items..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
               />
             </div>
             <div className="flex gap-2">
               <select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
                 className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 min-w-[150px]"
               >
                 <option value="all">All Categories</option>
                 {categories.map(category => (
                   <option key={category} value={category}>{category}</option>
                 ))}
               </select>
             </div>
           </div>
           
           {/* Results count */}
           <div className="text-sm text-gray-600">
             Showing {filteredItems.length} of {menuItems.length} items
             {searchQuery && ` for "${searchQuery}"`}
             {selectedCategory !== 'all' && ` in ${selectedCategory}`}
           </div>
         </div>

        

                 {/* Menu Items */}
         {filteredItems.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredItems.map((item) => (
               <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                 <FoodImage item={item} />
                 
                 <div className="p-4">
                   <div className="flex items-start justify-between mb-2">
                     <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                     <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                   </div>
                   
                   <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                   
                   <div className="flex items-center justify-between">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                       {item.category}
                     </span>
                     
                     <div className="flex items-center space-x-2">
                       {cart[item.id || item._id] ? (
                         <>
                           <button
                             onClick={() => removeFromCart(item.id || item._id)}
                             className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                           >
                             <Minus className="h-4 w-4" />
                           </button>
                           <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
                             {cart[item.id || item._id].quantity}
                           </span>
                           <button
                             onClick={() => addToCart(item)}
                             className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                           >
                             <Plus className="h-4 w-4" />
                           </button>
                         </>
                       ) : (
                         <button
                           onClick={() => addToCart(item)}
                           className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                         >
                           <Plus className="h-4 w-4 mr-1" />
                           Add
                         </button>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No items found matching your criteria.' 
                : 'No menu items available at the moment.'}
            </div>
          </div>
        )}
      </div>

             {/* Floating Cart Summary */}
       {getCartItemCount() > 0 && (
         <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 backdrop-blur-sm bg-white/95">
           <div className="text-center">
             <div className="text-sm text-gray-600 mb-1">Cart Total</div>
             <div className="text-2xl font-bold text-blue-600 mb-3">₹{getCartTotal()}</div>
             <Link
               to="/cart"
               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
             >
               View Cart ({getCartItemCount()})
             </Link>
           </div>
         </div>
       )}
    </div>
  );
};

export default Menu;
