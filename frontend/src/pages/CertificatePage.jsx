import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Download, Award, Loader2, ArrowLeft } from 'lucide-react';

export const CertificatePage = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/enrollments/certificate/${id}`);
        setCertificate(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate not found or course not completed.');
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-center px-4">
        <Award className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Certificate Unavailable</h1>
        <p className="text-slate-400 mb-8">{error}</p>
        <Link to="/dashboard" className="px-6 py-3 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple/90 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
        <Link to="/dashboard" className="flex items-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center px-4 py-2 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple/90 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Print / Save PDF
        </button>
      </div>

      <div className="w-full max-w-4xl bg-white text-slate-800 p-12 relative shadow-2xl overflow-hidden print:shadow-none print:p-0">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-brand-purple" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-brand-purple" />
        <div className="absolute top-4 left-4 w-[calc(100%-32px)] h-[calc(100%-32px)] border-2 border-slate-200 pointer-events-none" />
        <div className="absolute top-6 left-6 w-[calc(100%-48px)] h-[calc(100%-48px)] border border-slate-100 pointer-events-none" />

        <div className="flex justify-between items-start mb-16 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-brand-purple tracking-wider">SKILLHUB</h2>
            <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Certificate of Completion</p>
          </div>
          <Award className="w-16 h-16 text-amber-500" />
        </div>

        <div className="text-center relative z-10 mb-16">
          <p className="text-xl text-slate-600 mb-4 uppercase tracking-widest">This certifies that</p>
          <h1 className="text-5xl font-bold text-slate-900 mb-8 font-serif italic">
            {certificate.studentName}
          </h1>
          <p className="text-xl text-slate-600 mb-2">has successfully completed the course</p>
          <h2 className="text-3xl font-bold text-brand-purple mb-8">
            {certificate.courseName}
          </h2>
          <p className="text-slate-500">
            Completed on {new Date(certificate.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex justify-between items-end mt-24 relative z-10 px-8">
          <div className="text-center">
            <div className="w-48 border-b-2 border-slate-400 mb-2 pb-2">
              <span className="font-serif italic text-2xl text-slate-800">{certificate.instructorName}</span>
            </div>
            <p className="text-sm text-slate-500 uppercase tracking-wider">Course Instructor</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b-2 border-slate-400 mb-2 pb-2">
              <span className="font-serif italic text-2xl text-slate-800">SkillHub Admin</span>
            </div>
            <p className="text-sm text-slate-500 uppercase tracking-wider">Platform Director</p>
          </div>
        </div>

        {/* Certificate ID */}
        <div className="absolute bottom-8 left-0 w-full text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Certificate ID: {certificate.enrollmentId}
          </p>
        </div>
      </div>
    </div>
  );
};
