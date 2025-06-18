import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Dependent {
  id: string;
  user_id: string;
  name: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

interface DependentForm {
  name: string;
  birth_date: string;
}

const Children: React.FC = () => {
  const { user } = useAuth();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [form, setForm] = useState<DependentForm>({
    name: '',
    birth_date: ''
  });
  const [errors, setErrors] = useState<Partial<DependentForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDependents();
    }
  }, [user]);

  const fetchDependents = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:3001/users/${user.id}/dependents`);
      if (response.ok) {
        const data = await response.json();
        setDependents(data);
      } else {
        console.error('Failed to fetch dependents');
      }
    } catch (error) {
      console.error('Error fetching dependents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DependentForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Child\'s name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Birth date is optional, but if provided, validate it
    if (form.birth_date) {
      const birthDate = new Date(form.birth_date);
      const today = new Date();
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 18); // Max 18 years old
      
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      } else if (birthDate < maxAge) {
        newErrors.birth_date = 'Child must be under 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const url = editingDependent 
        ? `http://localhost:3001/dependents/${editingDependent.id}`
        : 'http://localhost:3001/dependents';
      
      const method = editingDependent ? 'PUT' : 'POST';
      
      const body = {
        user_id: user.id,
        name: form.name.trim(),
        birth_date: form.birth_date || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const savedDependent = await response.json();
        
        if (editingDependent) {
          // Update existing dependent
          setDependents(prev => prev.map(dep => 
            dep.id === editingDependent.id ? savedDependent : dep
          ));
        } else {
          // Add new dependent
          setDependents(prev => [...prev, savedDependent]);
        }
        
        closeModal();
      } else {
        const error = await response.json();
        alert(`Failed to save child: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving dependent:', error);
      alert('An error occurred while saving the child');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (dependent: Dependent) => {
    setEditingDependent(dependent);
    setForm({
      name: dependent.name,
      birth_date: dependent.birth_date ? dependent.birth_date.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (dependent: Dependent) => {
    if (!window.confirm(`Are you sure you want to remove ${dependent.name} from your account?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/dependents/${dependent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDependents(prev => prev.filter(dep => dep.id !== dependent.id));
      } else {
        const error = await response.json();
        alert(`Failed to delete child: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting dependent:', error);
      alert('An error occurred while deleting the child');
    }
  };

  const openAddModal = () => {
    setEditingDependent(null);
    setForm({ name: '', birth_date: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDependent(null);
    setForm({ name: '', birth_date: '' });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof DependentForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <p className="text-gray-600 mt-1">
            Manage your children's information for childcare bookings
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Child
        </button>
      </div>

      {/* Children List */}
      {dependents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
          <p className="text-gray-500 mb-4">
            Add your children's information to start making childcare bookings.
          </p>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Your First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dependents.map((dependent) => (
            <div key={dependent.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {dependent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(dependent)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(dependent)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{dependent.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Birth Date:</span>
                  <span>{formatDate(dependent.birth_date)}</span>
                </div>
                {dependent.birth_date && (
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span>{calculateAge(dependent.birth_date)} years old</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Added:</span>
                  <span>{formatDate(dependent.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDependent ? 'Edit Child' : 'Add New Child'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Child's Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter child's full name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                  Birth Date (optional)
                </label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.birth_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birth_date && (
                  <p className="mt-2 text-sm text-red-600">{errors.birth_date}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Birth date helps centers provide age-appropriate care
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingDependent ? 'Update Child' : 'Add Child')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Children; 