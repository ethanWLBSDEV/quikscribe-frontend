import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '../../.env' }); // Adjust the path based on the location of the .env file

const authenticateToken = (req, res, next) => {
  console.log('Received headers test:', req.headers);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Unauthorized: Token missing or invalid');
    return res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from the "Bearer <token>" format
  console.log('Extracted token:', token);  // Log the raw token

  try {
    // Verify the token and decode it
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified token:', verified); // Logs the fully verified token

    // Attach decoded user data to the request object for use in other middleware or routes
    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);

    // Handle token expiry
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token is expired:', error.message); // Log expired token details
      return res.status(403).json({ message: 'Forbidden: Token expired' });
    }

    // Handle other token errors
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

export default authenticateToken;
