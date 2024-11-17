import { jwtDecode } from 'jwt-decode';  // Corrected import

interface DecodedToken {
  exp: number;  // Expiry time in seconds
  [key: string]: any;  // Additional properties in the decoded token
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = localStorage.getItem('jwtToken');  // Use 'jwtToken' here, not 'token'
    console.log('Authorization Token fileUpload:', token);

    if (!token) {
      throw new Error('No authorization token found. Please log in.');
    }

    // Decode the token and check if it's expired
    const decodedToken: DecodedToken = jwtDecode(token); // using the jwtDecode function
    const currentTime = Date.now() / 1000; // Current time in seconds

    if (decodedToken.exp < currentTime) {
      throw new Error('Token is expired. Please log in again.');
    }

    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file');
    }

    return data.message; // Success message
  } catch (error: any) {
    console.error('Error uploading file:', error.message || error);
    alert(`Error uploading file: ${error.message || 'Please try again.'}`);
    throw error; // Re-throw error for further handling if needed
  }
};
