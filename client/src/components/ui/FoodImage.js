import React, { useState } from 'react';
import { Utensils, Coffee, Pizza, Soup, Salad, Sandwich, Cake, Apple } from 'lucide-react';

const FoodImage = ({ item, className = "w-full h-48 object-cover" }) => {
  const [imageError, setImageError] = useState(false);

  // Get appropriate icon based on category
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('coffee') || categoryLower.includes('tea') || categoryLower.includes('beverage') || categoryLower.includes('drink')) {
      return <Coffee className="h-16 w-16 text-amber-600" />;
    } else if (categoryLower.includes('pizza') || categoryLower.includes('italian') || categoryLower.includes('pasta')) {
      return <Pizza className="h-16 w-16 text-red-600" />;
    } else if (categoryLower.includes('burger') || categoryLower.includes('fast food') || categoryLower.includes('sandwich')) {
      return <Sandwich className="h-16 w-16 text-orange-600" />;
    } else if (categoryLower.includes('dessert') || categoryLower.includes('sweet') || categoryLower.includes('cake')) {
      return <Cake className="h-16 w-16 text-pink-600" />;
    } else if (categoryLower.includes('healthy') || categoryLower.includes('salad') || categoryLower.includes('vegetable')) {
      return <Salad className="h-16 w-16 text-green-600" />;
    } else if (categoryLower.includes('soup') || categoryLower.includes('stew')) {
      return <Soup className="h-16 w-16 text-orange-500" />;
    } else if (categoryLower.includes('fruit') || categoryLower.includes('fresh')) {
      return <Apple className="h-16 w-16 text-red-500" />;
    } else {
      return <Utensils className="h-16 w-16 text-gray-600" />;
    }
  };

  // Get background color based on category
  const getCategoryBg = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('coffee') || categoryLower.includes('tea') || categoryLower.includes('beverage') || categoryLower.includes('drink')) {
      return 'bg-amber-50';
    } else if (categoryLower.includes('pizza') || categoryLower.includes('italian') || categoryLower.includes('pasta')) {
      return 'bg-red-50';
    } else if (categoryLower.includes('burger') || categoryLower.includes('fast food') || categoryLower.includes('sandwich')) {
      return 'bg-orange-50';
    } else if (categoryLower.includes('dessert') || categoryLower.includes('sweet') || categoryLower.includes('cake')) {
      return 'bg-pink-50';
    } else if (categoryLower.includes('healthy') || categoryLower.includes('salad') || categoryLower.includes('vegetable')) {
      return 'bg-green-50';
    } else if (categoryLower.includes('soup') || categoryLower.includes('stew')) {
      return 'bg-orange-50';
    } else if (categoryLower.includes('fruit') || categoryLower.includes('fresh')) {
      return 'bg-red-50';
    } else {
      return 'bg-gray-50';
    }
  };

  // If no image or image failed to load, show placeholder
  if (!item.image || item.image.trim() === '' || imageError) {
    return (
      <div className={`${getCategoryBg(item.category)} flex items-center justify-center ${className}`}>
        {getCategoryIcon(item.category)}
      </div>
    );
  }

  // Show image with error handling
  return (
    <img
      src={item.image}
      alt={item.name}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default FoodImage;
