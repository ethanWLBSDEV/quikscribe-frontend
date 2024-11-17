export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload file');
      return data.message;
  } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      throw error;
  }
};
