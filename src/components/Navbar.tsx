import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // This effect will run on component mount or after the token is set/removed
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');  // Check for 'jwtToken' key
    console.log('Token from localStorage:', token);

    // Update login status based on token presence
    if (token) {
      setIsLoggedIn(true);
      console.log('User is logged in');
    } else {
      setIsLoggedIn(false);
      console.log('No valid login info found, user not logged in.');
    }
  }, []); // This will run on component mount

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('jwtToken');  // Remove 'jwtToken'
    setIsLoggedIn(false);  // Update the state immediately
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <ScrollLink to="hero" className="flex items-center cursor-pointer">
            <img src="src/assets/logo.svg" alt="logo" className='w-16' />
            <span className="ml-2 text-2xl font-bold text-gray-900">Quikscribe.in</span>
          </ScrollLink>

          <div className="hidden md:flex items-center space-x-8">
            <ScrollLink to="features" smooth={true} duration={500} className="text-gray-600 hover:text-gray-900 cursor-pointer">Features</ScrollLink>
            <ScrollLink to="about" smooth={true} duration={500} className="text-gray-600 hover:text-gray-900 cursor-pointer">About</ScrollLink>
            <ScrollLink to="contact" smooth={true} duration={500} className="text-gray-600 hover:text-gray-900 cursor-pointer">Contact</ScrollLink>
            <ScrollLink to="pricing" smooth={true} duration={500} className="text-gray-600 hover:text-gray-900 cursor-pointer">Pricing</ScrollLink>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="text-gray-600 hover:text-gray-900" onClick={() => {
                  console.log('Navigating to SignIn page...');
                  navigate('/signin');
                }}>Log in</button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors" onClick={() => {
                  console.log('Navigating to SignUp page...');
                  navigate('/signup');
                }}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
