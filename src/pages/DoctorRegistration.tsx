import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { DoctorProfile } from '../types';
import { motion } from 'motion/react';
import { Upload, FileCheck, Award, Briefcase, UserRound, GraduationCap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorRegistration = () => {
  const { userData, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<DoctorProfile | null>(null);

  const [formData, setFormData] = useState({
    specialty: '',
    qualifications: '',
    experience: '',
    bio: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'doctors', user.uid));
        if (docSnap.exists()) {
          const profile = docSnap.data() as DoctorProfile;
          setExistingProfile(profile);
          if (profile.approvalStatus === 'approved') {
            navigate('/profile');
          }
        }
      }
    };
    checkProfile();
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const certificateUrls: string[] = [];
      
      // Upload certificates
      for (const file of files) {
        const fileRef = ref(storage, `certificates/${user.uid}/${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        certificateUrls.push(url);
      }

      const profile: DoctorProfile = {
        userId: user.uid,
        specialty: formData.specialty,
        qualifications: formData.qualifications,
        experience: formData.experience,
        bio: formData.bio,
        certificates: certificateUrls,
        availability: {},
        approvalStatus: 'pending',
      };

      await setDoc(doc(db, 'doctors', user.uid), profile);
      setExistingProfile(profile);
      toast.success('Professional profile submitted for review!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  if (existingProfile?.approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-surface-bg dark:bg-slate-950 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-sleek-lg shadow-2xl border border-white dark:border-slate-800 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-brand" />
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
          <h2 className="text-3xl font-black dark:text-white mb-6 tracking-tight">Application <span className="text-brand">Pending</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 leading-loose font-medium">
            Your professional profile has been submitted. Our team is currently verifying your credentials. You'll be notified within 48 hours.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-black rounded-xl transition-all shadow-xl shadow-brand/20 active:scale-95"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg dark:bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white dark:bg-slate-900 rounded-sleek-lg p-10 lg:p-16 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="w-20 h-20 bg-brand rounded-sleek flex items-center justify-center shadow-2xl shadow-brand/30">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black dark:text-white tracking-tight">Become an <span className="text-brand">Expert</span></h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1 tracking-tight">Showcase your medical expertise to patients worldwide.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand" />
                  Primary Specialty
                </label>
                <select
                  required
                  value={formData.specialty}
                  onChange={e => setFormData({...formData, specialty: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-bold appearance-none cursor-pointer"
                >
                  <option value="">Select Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand" />
                  Years in Field
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 years"
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <UserRound className="w-4 h-4 text-brand" />
                 Professional Bio & Philosophy
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe your medical approach and standard of care..."
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Academic Background
              </label>
              <textarea
                required
                rows={4}
                placeholder="List your med school, residency, and fellowships..."
                value={formData.qualifications}
                onChange={e => setFormData({...formData, qualifications: e.target.value})}
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Supporting Documentation
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-sleek p-16 text-center hover:border-brand transition-all bg-slate-50 dark:bg-slate-950 group cursor-pointer relative shadow-inner">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand transition-colors" />
                </div>
                <p className="text-slate-900 dark:text-white font-black text-lg">Upload Credentials</p>
                <p className="text-sm text-slate-400 mt-2 font-medium">Medical licenses, board certifications, etc.</p>
              </div>
              
              {files.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                  {files.map((file, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 px-5 py-2.5 bg-brand/5 text-brand rounded-2xl text-xs font-black uppercase tracking-tighter border border-brand/10 shadow-sm"
                    >
                      <FileCheck className="w-4 h-4" />
                      {file.name}
                    </motion.div>
                  )) || null}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand hover:bg-brand-hover text-white font-black rounded-sleek transition-all shadow-2xl shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-xl tracking-tight active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Finalize Profile'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
