import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Search, UploadCloud } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = ({ label, error, className = '', ...props }: InputFieldProps) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="mb-1.5 text-sm font-medium text-slate-900">{label}</label>}
      <input
        className={`px-4 py-2 border rounded-lg outline-none transition-colors 
          ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-600'}
          placeholder-slate-400 text-slate-900`}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextAreaField = ({ label, error, className = '', ...props }: TextAreaFieldProps) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="mb-1.5 text-sm font-medium text-slate-900">{label}</label>}
      <textarea
        className={`px-4 py-2 border rounded-lg outline-none transition-colors resize-y min-h-[100px]
          ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-600'}
          placeholder-slate-400 text-slate-900`}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const SelectField = ({ label, error, options, className = '', ...props }: SelectFieldProps) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="mb-1.5 text-sm font-medium text-slate-900">{label}</label>}
      <select
        className={`px-4 py-2 border rounded-lg outline-none transition-colors bg-white
          ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-600'}
          text-slate-900`}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const SearchField = ({ ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search className="absolute left-3 w-4 h-4 text-slate-400" />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-primary-600 transition-all text-sm"
        placeholder="Search..."
        {...props}
      />
    </div>
  );
};

export const UploadField = ({ label, onChange, accept = "image/*,.pdf" }: { label?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, accept?: string }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1.5 text-sm font-medium text-slate-900">{label}</label>}
      <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary-600 transition-colors mb-2" />
        <span className="text-sm text-slate-500 font-medium">Click to upload or drag and drop</span>
        <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or PDF (MAX. 5MB)</span>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onChange}
          accept={accept}
        />
      </div>
    </div>
  );
};
