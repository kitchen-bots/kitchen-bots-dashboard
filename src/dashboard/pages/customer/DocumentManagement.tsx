import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Book,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Maximize2,
  Receipt,
  Search,
  Share2,
  Upload,
  Wrench,
  Filter,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  UploadDocumentModal,
  DocumentItem,
} from '../../components/Modals/UploadDocumentModal';

const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Maintenance_Guide_V2.pdf',
    size: '4.2 MB',
    type: 'MANUAL',
    product: 'Commercial BBQ Grill',
    date: 'Oct 24, 2023',
    version: 'v2.1',
    owner: 'Rahul Sharma',
  },
  {
    id: 'doc-2',
    name: 'Installation_Invoice_7721.pdf',
    size: '1.8 MB',
    type: 'INVOICE',
    product: 'Rocket Stove (Single Burner)',
    date: 'Oct 22, 2023',
    version: 'v1.0',
    owner: 'Ops Billing',
  },
  {
    id: 'doc-3',
    name: 'ISO_9001_Certification.pdf',
    size: '2.1 MB',
    type: 'CERT',
    product: 'Industrial 4-Burner Gas Range',
    date: 'Oct 15, 2023',
    version: 'v3.0',
    owner: 'Quality Assurance',
  },
  {
    id: 'doc-4',
    name: 'Quarterly_Service_Report_Q3.pdf',
    size: '3.4 MB',
    type: 'SERVICE',
    product: 'Commercial Exhaust Hood 6ft',
    date: 'Sep 30, 2023',
    version: 'v1.1',
    owner: 'Field Engineering',
  },
  {
    id: 'doc-5',
    name: 'Electrical_Schematics_RevC.pdf',
    size: '5.6 MB',
    type: 'MANUAL',
    product: 'Food Processing Machine',
    date: 'Sep 18, 2023',
    version: 'v2.4',
    owner: 'Hardware Team',
  },
];

export const DocumentManagement: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = location.pathname.startsWith('/admin');
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(initialDocuments[0]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const homePath = isAdmin ? '/admin' : '/dashboard';

  // Handle URL action parameter (e.g. from Quick Actions or Dashboard navigation)
  useEffect(() => {
    if (searchParams.get('action') === 'upload') {
      setIsUploadModalOpen(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('action');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const handleDownload = (doc: DocumentItem) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (doc.url) {
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = doc.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = [
        'Kitchen Bots Commercial Asset Document',
        '---------------------------------------',
        `Document Name: ${doc.name}`,
        `Classification: ${doc.type}`,
        `Equipment Unit: ${doc.product}`,
        `Revision Version: ${doc.version}`,
        `Custodian / Owner: ${doc.owner}`,
        `Date Logged: ${doc.date}`,
        'Security Status: Operational Asset - Commercial Confidential',
        '',
        'This record was retrieved from the Kitchen Bots Document Repository.',
      ].join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name.endsWith('.pdf')
        ? doc.name.replace(/\.pdf$/, '.txt')
        : `${doc.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    showToast('Download Complete', `${doc.name} download initiated.`, 'success');
  };

  const handleShare = (doc: DocumentItem) => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast('Link Copied', `Secure access link copied for ${doc.name}`, 'success');
  };

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    showToast(
      'Document Uploaded',
      `${newDoc.name} has been added to the repository.`,
      'success'
    );
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalCount = documents.length;
  const invoiceCount = documents.filter((d) => d.type === 'INVOICE').length;
  const manualCount = documents.filter((d) => d.type === 'MANUAL').length;
  const serviceCount = documents.filter((d) => d.type === 'SERVICE').length;

  const getTypeBadge = (type: DocumentItem['type']) => {
    switch (type) {
      case 'MANUAL':
        return <Badge variant="secondary">Manual</Badge>;
      case 'INVOICE':
        return <Badge variant="outline">Invoice</Badge>;
      case 'CERT':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Cert
          </Badge>
        );
      case 'SERVICE':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Service
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <PageContainer
      title="Documents"
      description="Centralized repository for commercial equipment assets, specifications, invoices, and service records."
      homeHref={homePath}
      breadcrumbs={[
        { label: isAdmin ? 'Admin' : 'Dashboard', href: homePath },
        { label: 'Documents' },
      ]}
      actions={
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
      }
    >
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Documents
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <FolderOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Managed assets across all fleets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Invoices
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{invoiceCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Commercial transaction bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Manuals & Specs
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Book className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{manualCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Installation and user guides</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Service Reports
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Wrench className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{serviceCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Maintenance logs and certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter and Documents Area */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Filter Panel */}
        <Card className="w-full xl:w-64 shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Filter Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Document Type
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Types', value: 'ALL' },
                  { label: 'Invoices', value: 'INVOICE' },
                  { label: 'Manuals', value: 'MANUAL' },
                  { label: 'Certifications', value: 'CERT' },
                  { label: 'Service Reports', value: 'SERVICE' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedType(item.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      selectedType === item.value
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Search File or Product
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name..."
                  className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs cursor-pointer"
                onClick={() => {
                  setSelectedType('ALL');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold">Repository Files</CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredDocs.length} matching asset records
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground">
                  <th className="p-3 pl-4 whitespace-nowrap">File Name</th>
                  <th className="p-3 whitespace-nowrap">Type</th>
                  <th className="p-3 whitespace-nowrap">Related Product</th>
                  <th className="p-3 whitespace-nowrap">Date</th>
                  <th className="p-3 pr-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p>No documents match your filter criteria.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsUploadModalOpen(true)}
                          className="gap-2 mt-1 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Document</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isSelected = selectedDoc.id === doc.id;
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`transition-colors cursor-pointer hover:bg-muted/30 ${
                          isSelected ? 'bg-muted/40 font-medium' : ''
                        }`}
                      >
                        <td className="p-3 pl-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-foreground hover:text-primary transition-colors">
                                {doc.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{doc.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">{getTypeBadge(doc.type)}</td>
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                          {doc.product}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                          {doc.date}
                        </td>
                        <td className="p-3 pr-4 text-right whitespace-nowrap">
                          <div
                            className="flex justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => handleDownload(doc)}
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => handleShare(doc)}
                              title="Share document link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing 1 to {filteredDocs.length} of {documents.length} files
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Preview Panel */}
        <Card className="hidden 2xl:flex w-[320px] shrink-0 flex-col border border-border/80 shadow-sm rounded-xl overflow-hidden bg-card">
          <CardHeader className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold text-foreground">Document Details</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setIsPreviewModalOpen(true)}
                title="Full Preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs flex-1 flex flex-col justify-between">
            {/* File Header Preview Card */}
            <div className="p-3 rounded-lg border border-border/70 bg-muted/30 flex items-start gap-2.5">
              <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate text-xs" title={selectedDoc.name}>
                  {selectedDoc.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                    {selectedDoc.type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">{selectedDoc.size}</span>
                </div>
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
                <span className="text-muted-foreground">Version</span>
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                  {selectedDoc.version}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium text-foreground truncate max-w-[140px]">{selectedDoc.owner}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
                <span className="text-muted-foreground">Hardware Unit</span>
                <span className="font-medium text-foreground truncate max-w-[140px]" title={selectedDoc.product}>
                  {selectedDoc.product}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
                <span className="text-muted-foreground">Date Indexed</span>
                <span className="font-medium text-foreground">{selectedDoc.date}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2">
              <Button
                onClick={() => handleDownload(selectedDoc)}
                className="w-full gap-2 cursor-pointer text-xs font-semibold py-2.5 h-10 shadow-sm"
                size="sm"
                title={`Download ${selectedDoc.name}`}
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download File</span>
                <span className="text-[10px] opacity-80 ml-auto font-mono bg-primary-foreground/15 px-1.5 py-0.5 rounded">
                  {selectedDoc.size}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Document Full Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={selectedDoc.name}
        description={`Classification: ${selectedDoc.type} | Hardware: ${selectedDoc.product}`}
      >
        <div className="space-y-4 py-2">
          {selectedDoc.file && selectedDoc.file.type.startsWith('image/') ? (
            <div className="rounded-lg overflow-hidden border border-border bg-muted/20 p-2 flex items-center justify-center">
              <img
                src={selectedDoc.url}
                alt={selectedDoc.name}
                className="max-h-80 object-contain rounded"
              />
            </div>
          ) : (
            <div className="p-6 rounded-lg border border-border bg-muted/20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedDoc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDoc.size} • {selectedDoc.version}
                </p>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                This document is managed under the Kitchen Bots commercial equipment repository and
                assigned to {selectedDoc.owner}.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Equipment Unit</span>
              <span className="font-semibold text-foreground">{selectedDoc.product}</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Custodian</span>
              <span className="font-semibold text-foreground">{selectedDoc.owner}</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Version</span>
              <span className="font-semibold text-foreground">{selectedDoc.version}</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-muted-foreground block mb-1">Date Indexed</span>
              <span className="font-semibold text-foreground">{selectedDoc.date}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewModalOpen(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownload(selectedDoc)}
              className="gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default DocumentManagement;
