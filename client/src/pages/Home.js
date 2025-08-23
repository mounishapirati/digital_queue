import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Utensils, 
  FileText, 
  Clock, 
  Users, 
  TrendingUp,
  Shield,
  Smartphone,
  Zap
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Utensils className="h-8 w-8 text-primary-600" />,
      title: 'Canteen Service',
      description: 'Order delicious food from the college canteen and get a unique QR code for collection.',
      link: '/menu',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <FileText className="h-8 w-8 text-primary-600" />,
      title: 'Xerox Service',
      description: 'Upload documents and get them printed with various options like binding and color.',
      link: '/xerox',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Digital Queue',
      description: 'Join virtual queues and get real-time updates on your position.',
      link: '/queue',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Student Portal',
      description: 'Access your orders, track status, and manage your profile easily.',
      link: '/profile',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: 'Secure & Safe',
      description: 'Contactless ordering and payment for your safety'
    },
    {
      icon: <Smartphone className="h-6 w-6 text-blue-600" />,
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices and screen sizes'
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your orders and queue status'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: 'Efficient Service',
      description: 'Reduce waiting time and improve service quality'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              College Digital Queue System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Streamline your college experience with smart canteen ordering and xerox services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  to="/menu"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Order Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our comprehensive range of digital services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  {isAuthenticated && (
                    <Link
                      to={feature.link}
                      className={`inline-block bg-gradient-to-r ${feature.color} text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity`}
                    >
                      Access Service
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to get started with our digital services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Choose Service
              </h3>
              <p className="text-gray-600">
                Select between canteen food ordering or xerox document printing services
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Place Order
              </h3>
              <p className="text-gray-600">
                For canteen: Add items to cart and pay. For xerox: Upload files and specify options
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Collect & Enjoy
              </h3>
              <p className="text-gray-600">
                Show QR code for food collection or collect printed documents when ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the benefits of digital transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students already using our digital services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Register Now
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link
                to="/menu"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Ordering
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
