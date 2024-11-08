import React, { useState } from 'react';

const AdminSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!email || !password) {
      setError('Email and Password are required.');
      return;
    }
  
    setLoading(true);
    setError(''); // Clear any previous error
  
    try {
      const response = await fetch('http://localhost:5000/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        localStorage.setItem('token', token); // Save the JWT token
  
        // Decode the token to check for admin role
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the token
        if (decoded.type !== 'admin') {  // Check if the user is NOT an admin
          alert('Access denied. Admins only.');
          localStorage.removeItem('token'); // Remove the token for non-admin users
          return; // Stop the process if the user is not an admin
        }
  
        alert('Sign In Successful!');  // Success alert for admin users
        window.location.href = '/admin/dashboard';  // Redirect to Admin Dashboard
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred while signing in.');
        alert(errorData.message || 'An error occurred while signing in.');  // Show error alert
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      alert('An unexpected error occurred. Please try again.');  // Show error alert on unexpected errors
    } finally {
      setLoading(false);  // Stop loading spinner
    }
  };
  

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>Admin SignIn</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <button 
          type="submit" 
          style={{
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            fontSize: '16px', 
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}  // Disable button when loading
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default AdminSignIn;
