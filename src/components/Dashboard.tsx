import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();

  // Check if user is logged in by verifying token
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/signin'); // Redirect to sign-in if no token
      return;
    }

    // Fetch user data from backend using token
    fetch('http://localhost:5000/api/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user); // Set user data on successful response
        } else {
          localStorage.removeItem('token');
          navigate('/signin'); // Redirect to sign-in if token is invalid
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        navigate('/signin'); // Redirect to sign-in on error
      });
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>; // Display loading state while fetching user data
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h1>
        <p className="mt-4 text-gray-600">You are now on your dashboard.</p>
        <button
          onClick={() => {
            localStorage.removeItem('token'); // Remove token on logout
            navigate('/signin'); // Redirect to sign-in
          }}
          className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
