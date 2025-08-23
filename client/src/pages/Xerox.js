import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  Printer, 
  Settings, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Xerox = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    copies: 1,
    paperSize: 'A4',
    colorMode: 'black',
    binding: 'none',
    specialInstructions: '',
    paymentMethod: 'offline'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploaded'
    }));
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePrice = () => {
    let basePrice = 2; // Base price per page
    if (orderDetails.paperSize === 'A3') basePrice *= 1.5;
    if (orderDetails.colorMode === 'color') basePrice *= 2;
    if (orderDetails.binding === 'staples') basePrice += 5;
    if (orderDetails.binding === 'spiral') basePrice += 15;
    if (orderDetails.binding === 'hardcover') basePrice += 25;

    const totalPages = files.length; // Assuming 1 page per file
    return basePrice * totalPages * orderDetails.copies;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('copies', orderDetails.copies);
      formData.append('paperSize', orderDetails.paperSize);
      formData.append('colorMode', orderDetails.colorMode);
      formData.append('binding', orderDetails.binding);
      formData.append('specialInstructions', orderDetails.specialInstructions);
      formData.append('paymentMethod', orderDetails.paymentMethod);

      files.forEach((fileObj, index) => {
        formData.append('files', fileObj.file);
      });

      const response = await fetch('/api/xerox', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to place xerox order');
      }

      const result = await response.json();
      toast.success('Xerox order placed successfully!');
      
      // Reset form
      setFiles([]);
      setOrderDetails({
        copies: 1,
        paperSize: 'A4',
        colorMode: 'black',
        binding: 'none',
        specialInstructions: '',
        paymentMethod: 'offline'
      });

    } catch (error) {
      console.error('Error placing xerox order:', error);
      toast.error('Failed to place xerox order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricingInfo = {
    'A4': { black: 2, color: 4 },
    'A3': { black: 3, color: 6 },
    'Letter': { black: 2, color: 4 }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xerox Service</h1>
        <p className="text-gray-600">
          Upload your documents and get them printed with various options
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* File Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-primary-600 font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: PDF, DOC, DOCX, Images (Max: 10MB per file, Up to 5 files)
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {files.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {fileObj.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Details Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    name="copies"
                    min="1"
                    max="100"
                    value={orderDetails.copies}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Size
                  </label>
                  <select
                    name="paperSize"
                    value={orderDetails.paperSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Mode
                  </label>
                  <select
                    name="colorMode"
                    value={orderDetails.colorMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="black">Black & White</option>
                    <option value="color">Color</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Binding
                  </label>
                  <select
                    name="binding"
                    value={orderDetails.binding}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="none">No Binding</option>
                    <option value="staples">Staples</option>
                    <option value="spiral">Spiral Binding</option>
                    <option value="hardcover">Hardcover</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={orderDetails.specialInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requirements or instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={orderDetails.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="offline">Pay at Counter</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Xerox Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Pricing and Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Info</h2>
            
            {/* Pricing Table */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Price per Page</h3>
              <div className="space-y-2">
                {Object.entries(pricingInfo).map(([size, prices]) => (
                  <div key={size} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{size}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{prices.black} (B&W)
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{prices.color} (Color)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Binding Prices */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Binding Options</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Staples</span>
                  <span className="text-sm font-medium text-gray-900">₹5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Spiral</span>
                  <span className="text-sm font-medium text-gray-900">₹15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hardcover</span>
                  <span className="text-sm font-medium text-gray-900">₹25</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {files.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Files:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Copies:</span>
                    <span className="font-medium">{orderDetails.copies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paper:</span>
                    <span className="font-medium">{orderDetails.paperSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{orderDetails.colorMode}</span>
                  </div>
                  {orderDetails.binding !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Binding:</span>
                      <span className="font-medium">{orderDetails.binding}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary-600">₹{calculatePrice()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notes</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Files are processed in order of submission</li>
                <li>• You'll be notified when your order is ready</li>
                <li>• Collect your documents from the xerox counter</li>
                <li>• Keep your order number for reference</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Xerox;
