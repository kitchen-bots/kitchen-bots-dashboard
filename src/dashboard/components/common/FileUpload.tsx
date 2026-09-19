import { useCallback, useState } from 'react';
import { CheckCircle, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  helperText?: string;
}

export function FileUpload({ 
  onUpload,
  accept = '*/*', 
  maxSize = 10,
  label = 'Upload File',
  helperText = 'Drag & drop or click to browse'
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    setError(null);
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    // Basic type validation can be added here if accept is specific
    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    try {
      setIsUploading(true);
      setSuccess(false);
      await onUpload(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-primary-500 bg-emerald-500-50' : 'border-gray-300 hover:border-primary-400 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          onChange={handleChange}
          accept={accept}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-emerald-500-100 text-emerald-600-600' : 'bg-white text-gray-400 shadow-sm'}`}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            <p className="text-[10px] text-gray-400 mt-1">Max size: {maxSize}MB</p>
          </div>
        </div>

        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl"
            >
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-medium text-emerald-600-700">Uploading...</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-50 flex flex-col items-center justify-center rounded-xl border-green-200"
            >
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm font-medium text-green-700">Upload Complete</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
