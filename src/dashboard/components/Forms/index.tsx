import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Search, UploadCloud } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = ({ label, error, className = '', ...props }: InputFieldProps) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="mb-1.5 text-sm font-medium text-foreground">{label}</label>}
      <input
        className={`px-3 py-2 border rounded-md outline-none transition-colors bg-background text-foreground
          ${error ? 'border-destructive focus:ring-1 focus:ring-destructive' : 'border-input focus:border-ring focus:ring-1 focus:ring-ring'}
          placeholder:text-muted-foreground text-sm`}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-destructive">{error}</span>}
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
      {label && <label className="mb-1.5 text-sm font-medium text-foreground">{label}</label>}
      <textarea
        className={`px-3 py-2 border rounded-md outline-none transition-colors resize-y min-h-[100px] bg-background text-foreground
          ${error ? 'border-destructive focus:ring-1 focus:ring-destructive' : 'border-input focus:border-ring focus:ring-1 focus:ring-ring'}
          placeholder:text-muted-foreground text-sm`}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-destructive">{error}</span>}
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
      {label && <label className="mb-1.5 text-sm font-medium text-foreground">{label}</label>}
      <select
        className={`px-3 py-2 border rounded-md outline-none transition-colors bg-background text-foreground
          ${error ? 'border-destructive focus:ring-1 focus:ring-destructive' : 'border-input focus:border-ring focus:ring-1 focus:ring-ring'}
          text-sm`}
        {...props}
      >
        <option value="" disabled className="bg-popover text-foreground">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-popover text-foreground">{opt.label}</option>
        ))}
      </select>
      {error && <span className="mt-1 text-xs text-destructive">{error}</span>}
    </div>
  );
};

export const SearchField = ({ ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all text-sm text-foreground placeholder:text-muted-foreground"
        placeholder="Search..."
        {...props}
      />
    </div>
  );
};

export const UploadField = ({ label, onChange, accept = "image/*,.pdf" }: { label?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, accept?: string }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1.5 text-sm font-medium text-foreground">{label}</label>}
      <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
        <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors mb-2" />
        <span className="text-sm text-foreground font-medium">Click to upload or drag and drop</span>
        <span className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or PDF (MAX. 5MB)</span>
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
