import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  FileText,
  User,
  Calendar,
  MessageSquare,
  RefreshCw,
  MoreVertical,
  X
} from 'lucide-react';
import { VerificationService, type VerificationDocument } from '../../lib/services/verificationService';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase/client';

interface VerificationManagementPanelProps {
  currentAdminId: string;
}

interface VerificationWithUser extends VerificationDocument {
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const VerificationManagementPanel: React.FC<VerificationManagementPanelProps> = ({ currentAdminId }) => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationWithUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'in_review' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    setLoading(true);
    try {
      console.log('Loading verification requests...');
      const requests = await VerificationService.getAllVerificationRequests();
      console.log('Loaded requests:', requests);
      setVerificationRequests(requests);
    } catch (error) {
      console.error('Error loading verification requests:', error);
      // Zeige Fehler in der UI
      setVerificationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = verificationRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.users?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.users?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (requestId: string, status: 'pending' | 'in_review' | 'approved' | 'rejected', comment?: string) => {
    setProcessingRequest(requestId);
    try {
      await VerificationService.updateVerificationStatus(requestId, status, comment, currentAdminId);
      await loadVerificationRequests();
      
      // Schließe Modal wenn es geöffnet ist
      if (selectedRequest?.id === requestId) {
        setShowDetailsModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const [viewingDocument, setViewingDocument] = useState<{url: string, name: string, type: string} | null>(null);

  const handleViewDocument = async (fileUrl: string, fileName: string) => {
    try {
      // Bestimme den Dateityp basierend auf der Dateiendung
      const fileExtension = fileName.toLowerCase().split('.').pop();
      const isPdf = fileExtension === 'pdf';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension || '');
      
      let fileType = 'image'; // Default
      if (isPdf) {
        fileType = 'pdf';
      } else if (isImage) {
        fileType = 'image';
      }
      
      setViewingDocument({ url: fileUrl, name: fileName, type: fileType });
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_review': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'in_review': return 'In Bearbeitung';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return 'Unbekannt';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const VerificationDetailsModal: React.FC<{ request: VerificationWithUser; onClose: () => void }> = ({ request, onClose }) => {
    const [localComment, setLocalComment] = useState(request.admin_comment || '');
    const [localStatus, setLocalStatus] = useState(request.status);

    const handleUpdate = () => {
      handleStatusUpdate(request.id, localStatus, localComment);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Verifizierungsanfrage - {request.users?.first_name} {request.users?.last_name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              {/* Benutzerinformationen */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Benutzerinformationen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{request.users?.first_name} {request.users?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">E-Mail</p>
                    <p className="font-medium">{request.users?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Eingereicht am</p>
                    <p className="font-medium">{new Date(request.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aktueller Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dokumente */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Hochgeladene Dokumente</h4>
                <div className="space-y-3">
                  {/* Ausweis */}
                  {request.ausweis_url && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Ausweis</p>
                          <p className="text-sm text-gray-600">Identitätsnachweis</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <img
                          src={request.ausweis_url}
                          alt="Ausweis"
                          className="w-full h-auto max-h-96 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleViewDocument(request.ausweis_url!, 'ausweis.png')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Zertifikate */}
                  {request.zertifikate_urls && request.zertifikate_urls.length > 0 && (
                    <div className="space-y-4">
                      {request.zertifikate_urls.map((url, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">Zertifikat {index + 1}</p>
                              <p className="text-sm text-gray-600">Qualifikationsnachweis</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <img
                              src={url}
                              alt={`Zertifikat ${index + 1}`}
                              className="w-full h-auto max-h-96 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handleViewDocument(url, `zertifikat_${index + 1}.png`)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status-Update */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Status aktualisieren</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Neuer Status
                    </label>
                    <select
                      value={localStatus}
                      onChange={(e) => setLocalStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="in_review">In Bearbeitung</option>
                      <option value="approved">Genehmigt</option>
                      <option value="rejected">Abgelehnt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin-Kommentar
                    </label>
                    <textarea
                      value={localComment}
                      onChange={(e) => setLocalComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional: Kommentar zur Entscheidung..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={onClose}
                      variant="outline"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={processingRequest === request.id}
                      className="flex items-center gap-2"
                    >
                      {processingRequest === request.id ? (
                        <>
                          <LoadingSpinner />
                          Wird aktualisiert...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Status aktualisieren
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vergrößerungs-Modal für Bilder
  const DocumentViewerModal: React.FC<{ document: {url: string, name: string, type: string}, onClose: () => void }> = ({ document, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-[80vw] h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {document.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content - Vergrößerte Ansicht */}
          <div className="flex-1 bg-white flex items-center justify-center p-6">
            {document.type === 'pdf' ? (
              <iframe
                src={document.url}
                className="w-full h-full border-0 rounded-lg shadow-sm"
                title={document.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={document.url}
                  alt={document.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Verifizierungsverwaltung
          </h2>
          <p className="text-gray-600 mt-1">
            Verwaltung von Caretaker-Verifizierungsanfragen
          </p>
        </div>
        <Button
          onClick={loadVerificationRequests}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Filter und Suche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nach Name oder E-Mail suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="pending">Ausstehend</option>
              <option value="in_review">In Bearbeitung</option>
              <option value="approved">Genehmigt</option>
              <option value="rejected">Abgelehnt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {verificationRequests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Ausstehend</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {verificationRequests.filter(r => r.status === 'in_review').length}
              </p>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {verificationRequests.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Genehmigt</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {verificationRequests.filter(r => r.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Abgelehnt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verifizierungsanfragen Tabelle */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eingereicht
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dokumente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.users?.first_name} {request.users?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.users?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {request.ausweis_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FileText className="w-3 h-3" />
                            Ausweis
                          </span>
                        )}
                        {request.zertifikate_urls && request.zertifikate_urls.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FileText className="w-3 h-3" />
                            {request.zertifikate_urls.length} Zertifikat(e)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine Verifizierungsanfragen gefunden</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <VerificationDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Dokumentenansicht Modal */}
      {/* Vergrößerungs-Modal */}
      {viewingDocument && (
        <DocumentViewerModal
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};

export default VerificationManagementPanel;
