import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin } from 'lucide-react'
import { ApprovalService } from '../../lib/services/approvalService'
import { CaretakerProfileWithApproval, ApprovalDecision } from '../../lib/types/database.types'
import Button from '../ui/Button'
import { useAuth } from '../../lib/auth/AuthContext'

interface ApprovalManagementProps {
  className?: string
}

export const ApprovalManagement: React.FC<ApprovalManagementProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [pendingApprovals, setPendingApprovals] = useState<CaretakerProfileWithApproval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  useEffect(() => {
    loadPendingApprovals()
    loadStats()
  }, [])

  const loadPendingApprovals = async () => {
    try {
      setIsLoading(true)
      const approvals = await ApprovalService.getPendingApprovals()
      setPendingApprovals(approvals)
    } catch (error) {
      console.error('Fehler beim Laden der pending Freigaben:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const approvalStats = await ApprovalService.getApprovalStats()
      setStats(approvalStats)
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error)
    }
  }

  const handleApprovalDecision = async (caretakerId: string, decision: 'approved' | 'rejected', notes?: string) => {
    if (!user?.id) return

    setProcessingId(caretakerId)
    try {
      const approvalDecision: ApprovalDecision = {
        caretaker_id: caretakerId,
        approval_status: decision,
        approval_approved_at: new Date().toISOString(),
        approval_approved_by: user.id,
        approval_notes: notes
      }

      await ApprovalService.decideApproval(approvalDecision)
      
      // Liste neu laden
      await loadPendingApprovals()
      await loadStats()
      
      // Erfolgsmeldung anzeigen
    } catch (error) {
      console.error('Fehler bei Freigabe-Entscheidung:', error)
      // Fehlermeldung anzeigen
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getServicesText = (services: any) => {
    if (!services) return 'Keine Leistungen angegeben'
    
    if (Array.isArray(services)) {
      return services.join(', ')
    }
    
    if (typeof services === 'object') {
      return Object.keys(services).join(', ')
    }
    
    return 'Leistungen angegeben'
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Benutzer Freigabe</h2>
          <p className="text-sm text-gray-600">Verwaltung der Caretaker-Freigaben</p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-semibold text-yellow-600">{stats.pending}</span>
          <span className="text-sm text-gray-500">wartend</span>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Gesamt</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Wartend</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Freigegeben</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Abgelehnt</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Wartende Freigaben ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine wartenden Freigaben</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => {
              const userData = (approval as any).users
              return (
                <div key={approval.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        {userData.profile_photo_url ? (
                          <img 
                            src={userData.profile_photo_url} 
                            alt="Profilbild"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {userData.first_name} {userData.last_name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{userData.email}</span>
                            </div>
                            {userData.phone_number && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{userData.phone_number}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{userData.plz} {userData.city}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Über mich</p>
                          <p className="text-gray-600 line-clamp-2">
                            {approval.short_about_me || approval.long_about_me || 'Nicht angegeben'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Leistungen</p>
                          <p className="text-gray-600">
                            {getServicesText(approval.services)}
                          </p>
                        </div>
                        
                        {approval.experience_years && (
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Erfahrung</p>
                            <p className="text-gray-600">{approval.experience_years} Jahre</p>
                          </div>
                        )}
                        
                        {approval.hourly_rate && (
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Stundensatz</p>
                            <p className="text-gray-600">{approval.hourly_rate}€/h</p>
                          </div>
                        )}
                      </div>

                      {/* Request Date */}
                      <div className="mt-3 text-xs text-gray-500">
                        Angefordert am: {formatDate(approval.approval_requested_at)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={() => handleApprovalDecision(approval.id, 'approved')}
                        disabled={processingId === approval.id}
                        className="w-24"
                        variant="primary"
                        size="sm"
                      >
                        {processingId === approval.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Freigeben
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleApprovalDecision(approval.id, 'rejected')}
                        disabled={processingId === approval.id}
                        className="w-24"
                        variant="secondary"
                        size="sm"
                      >
                        {processingId === approval.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Ablehnen
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
