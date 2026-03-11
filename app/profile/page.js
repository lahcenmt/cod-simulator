"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileContent() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    company: '',
    website: '',
    bio: '',
    city: '',
    country: 'MA'
  });

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await getUserProfile(currentUser.uid);
      if (data) {
        setProfile(data);
        setFormData({
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || '',
          company: data.company || '',
          website: data.website || '',
          bio: data.bio || '',
          city: data.city || '',
          country: data.country || 'MA'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
      alert('Profile updated significantly!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
          <p className="text-slate-500">Manage your personal and company information.</p>
        </div>
        <button 
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Avatar & Account Info */}
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-4xl font-bold text-indigo-600 mb-4 overflow-hidden">
                {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    currentUser?.email?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">{formData.displayName || "User"}</h3>
              <p className="text-sm text-slate-500 mb-4">{currentUser?.email}</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-2">
                  <span>Plan</span>
                  <strong className="text-indigo-600 uppercase text-xs px-2 py-0.5 bg-indigo-100 rounded-md">
                    {profile?.plan || 'Free'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-2">
                  <span>Total Simulations</span>
                  <strong className="text-slate-900">{profile?.stats?.totalSimulations || 0}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Member Since</span>
                  <strong className="text-slate-900">
                    {profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="w-full md:w-2/3">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Personal Details</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  disabled={!editing}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-75 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Locked)</label>
                <input 
                  type="email" 
                  value={currentUser.email} 
                  disabled 
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  disabled={!editing}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-75 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</label>
                <input 
                  type="text" 
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={!editing}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-75 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                <input 
                  type="url" 
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!editing}
                  placeholder="https://"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-75 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                <select 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!editing}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-75 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select city</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Tangier">Tangier</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-75 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            {editing && (
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center min-w-[140px]"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}
