import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import ProductDetail from './Components/DetailSection';
import MenBestSellers from '../Menspage/Components/MensBestSeller';
import ProductReviews from './Components/ReviewsSection';
import AwsomeHumansFooter from '../../components/Footer';
import ProductFeatures from './Components/Features';
import { API_BASE_URL } from '../../config/api';

const ProductDetailPage = ({ children }) => {
  // Make sure we're getting the correct parameter name
  const params = useParams();
  const productId = params.productId; // This should match your route path parameter name
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Product ID from URL params:', productId);
    
    const fetchProductData = async () => {
      try {
        // Make sure the productId is available before making the request
        if (!productId) {
          setError('No product ID provided');
          setLoading(false);
          return;
        }
        
        const apiUrl = `${API_BASE_URL}/api/products/${productId}`;
        console.log('Making API request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success) {
          setProduct(data.data);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        console.error('Error details:', err);
        setError(`Error fetching product details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [productId]); // Make sure productId is in the dependency array

  if (loading) {
    return (
      <div className="font-poppins min-h-screen flex flex-col bg-shirting">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
        </div>
        <AwsomeHumansFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-poppins min-h-screen flex flex-col bg-shirting">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-claret">{error}</p>
        </div>
        <AwsomeHumansFooter />
      </div>
    );
  }

  return (
    <div className="font-poppins min-h-screen flex flex-col bg-shirting">
      <Header />
      {product && (
        <>
          <ProductDetail product={product} />
          <ProductFeatures product={product} />
          <main className="flex-grow mb-20">{children}</main>
        </>
      )}
      < AwsomeHumansFooter />
    </div>
  );
};

export default ProductDetailPage;