import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'MANUAL' | 'INVOICE' | 'CERT' | 'SERVICE';
  product: string;
  date: string;
  version: string;
  owner: string;
  file?: File;
  url?: string;
}

export interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: DocumentItem) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [docType, setDocType] = useState<DocumentItem['type']>('MANUAL');
  const [product, setProduct] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [owner, setOwner] = useState('Field Operations');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentTitle('');
    setDocType('MANUAL');
    setProduct('');
    setVersion('v1.0');
    setOwner('Field Operations');
    setError(null);
    setIsDragging(false);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25 MB limit.');
      return;
    }
    setSelectedFile(file);
    setDocumentTitle((prev) => (prev.trim() ? prev : file.name));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a document file to upload.');
      return;
    }
    if (!documentTitle.trim()) {
      setError('Document title is required.');
      return;
    }

    setIsSubmitting(true);

    const objectUrl = URL.createObjectURL(selectedFile);
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: documentTitle.trim(),
      size: formatFileSize(selectedFile.size),
      type: docType,
      product: product.trim() || 'General Commercial Fleet',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      version: version.trim() || 'v1.0',
      owner: owner.trim() || 'Field Operations',
      file: selectedFile,
      url: objectUrl,
    };

    onUploadSuccess(newDoc);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-card text-card-foreground rounded-xl shadow-xl border border-border flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">Upload Asset Document</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Attach technical manuals, invoices, or compliance certificates.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* File Dropzone */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Click to select file or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, XLSX, CSV, or Image (up to 25 MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  Change
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Document Title */}
            <div>
              <label
                htmlFor="doc-title-input"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Document Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="doc-title-input"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g. Maintenance_Guide_V2.pdf"
                className="text-xs"
              />
            </div>

            {/* Document Type */}
            <div>
              <label
                htmlFor="doc-type-select"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Classification Type
              </label>
              <select
                id="doc-type-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentItem['type'])}
                className="w-full h-10 px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="MANUAL">Manual & Specifications</option>
                <option value="INVOICE">Commercial Invoice</option>
                <option value="CERT">Compliance & Certification</option>
                <option value="SERVICE">Service & Maintenance Log</option>
              </select>
            </div>

            {/* Associated Equipment */}
            <div>
              <label
                htmlFor="doc-product-input"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Associated Equipment Unit
              </label>
              <input
                id="doc-product-input"
                list="equipment-options"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Select or enter equipment model..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <datalist id="equipment-options">
                <option value="GrillMaster 3000 PRO" />
                <option value="CoolFreeze Industrial" />
                <option value="Global Series Ranges" />
                <option value="SteamPro Commercial Oven" />
                <option value="Induction Top Double-Burner" />
                <option value="General Commercial Fleet" />
              </datalist>
            </div>

            {/* Version & Owner Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="doc-version-input"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Version
                </label>
                <Input
                  id="doc-version-input"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="doc-owner-input"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Custodian / Owner
                </label>
                <Input
                  id="doc-owner-input"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Field Operations"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-border flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                className="gap-2 cursor-pointer text-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
