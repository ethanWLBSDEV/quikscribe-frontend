import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'customer' | 'free' | 'pro' | 'company';
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/signin';
      return;
    }

    const decoded = JSON.parse(atob(token.split('.')[1]));
    if (decoded.type !== 'admin') {
      setError('Access denied. Admins only.');
      window.location.href = '/admin/signin';
    } else {
      fetchUsers(token);
    }
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  const changeUserType = async (userId: number, newType: User['type']) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: newType }),
      });
      if (response.ok) {
        setUsers((prevUsers) => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, type: newType } : user
          )
        );
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update user type');
      }
    } catch (error) {
      setError('Failed to update user type');
    }
  };
  
  

  if (loading) {
    return <div className="text-center mt-20 text-lg">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <p className="text-gray-600 mb-8">Welcome to the Admin Dashboard!</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-medium uppercase">ID</th>
              <th className="px-6 py-4 text-left font-medium uppercase">Name</th>
              <th className="px-6 py-4 text-left font-medium uppercase">Email</th>
              <th className="px-6 py-4 text-left font-medium uppercase">Type</th>
              <th className="px-6 py-4 text-left font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-none hover:bg-gray-100">
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className={`px-6 py-4 ${user.type === 'admin' ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                  {user.type}
                </td>
                <td className="px-6 py-4">
                  {user.type !== 'admin' ? (
                    <select
                      className="border border-gray-300 rounded-lg py-2 px-4"
                      value={user.type}
                      onChange={(e) => changeUserType(user.id, e.target.value as User['type'])}
                    >
                      <option value="customer">Customer</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="company">Company</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="text-gray-500">Admin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
