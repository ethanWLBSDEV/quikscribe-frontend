import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if the user is an admin by verifying the JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/signin';  // Redirect to SignIn if no token
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the token
      if (decoded.type !== 'admin') {
        setError('Access denied. Admins only.');
        window.location.href = '/admin/signin';  // Redirect to SignIn if not admin
      } else {
        setLoading(false);  // Admin is authenticated, proceed to show the dashboard
      }
    } catch (error) {
      setError('Invalid token. Please sign in again.');
      window.location.href = '/admin/signin';  // Redirect to SignIn on invalid token
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <p>Welcome to the Admin Dashboard!</p>
    </div>
  );
};

export default AdminDashboard;
