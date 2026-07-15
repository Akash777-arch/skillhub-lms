import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../lib/api';

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    thumbnailUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courses', {
        ...formData,
        price: Number(formData.price) || 0
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create a New Course</h1>
        <p className="text-text-secondary">Fill in the details below to publish your new course.</p>
      </div>

      <div className="bg-bg-secondary border border-slate-700/50 rounded-2xl p-8 shadow-xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Course Title" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Complete Web Development Bootcamp" 
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-bg-primary border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors resize-none"
              placeholder="What will students learn?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Category" 
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Programming" 
              required
            />
            <Input 
              label="Price (USD)" 
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00" 
            />
          </div>

          <Input 
            label="Thumbnail URL" 
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg" 
          />

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
