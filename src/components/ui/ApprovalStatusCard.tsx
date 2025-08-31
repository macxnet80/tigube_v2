import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, XCircle, AlertCircle, Send } from 'lucide-react'
import { ApprovalService } from '../../lib/services/approvalService'
import { ApprovalStatus } from '../../lib/types/database.types'
import Button from './Button'
import { useAuth } from '../../lib/auth/AuthContext'

interface ApprovalStatusCardProps {
  className?: string
}

export const ApprovalStatusCard: React.FC<ApprovalStatusCardProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [status, setStatus] = useState<ApprovalStatus>('pending')
  const [requestedAt, setRequestedAt] = useState<string | null>(null)
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadApprovalStatus()
      validateProfile()
    }
  }, [user?.id])

  const loadApprovalStatus = async () => {
    try {
      const approvalData = await ApprovalService.getApprovalStatus(user!.id)
      setStatus(approvalData.status)
      setRequestedAt(approvalData.requestedAt)
      setApprovedAt(approvalData.approvedAt)
      setNotes(approvalData.notes)
    } catch (error) {
      console.error('Fehler beim Laden des Freigabe-Status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateProfile = async () => {
    try {
      const validation = await ApprovalService.validateProfileForApproval(user!.id)
      setIsValid(validation.isValid)
      setMissingFields(validation.missingFields)
    } catch (error) {
      console.error('Fehler bei Profil-Validierung:', error)
    }
  }

  const handleRequestApproval = async () => {
    if (!user?.id) return

    setIsRequesting(true)
    try {
      await ApprovalService.requestApproval(user.id)
      await loadApprovalStatus()
      // Erfolgsmeldung anzeigen
    } catch (error) {
      console.error('Fehler bei Freigabe-Anfrage:', error)
      // Fehlermeldung anzeigen
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Freigegeben'
      case 'rejected':
        return 'Abgelehnt'
      case 'pending':
        return 'Wartend auf Freigabe'
      default:
        return 'Nicht zur Freigabe angemeldet'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
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

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profil-Freigabe Status</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-3 mb-6">
        {requestedAt && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Angefordert am:</span> {formatDate(requestedAt)}
          </div>
        )}
        
        {approvedAt && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Freigegeben am:</span> {formatDate(approvedAt)}
          </div>
        )}
        
        {notes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Notizen:</span> {notes}
          </div>
        )}
      </div>

      {/* Profil-Validierung */}
      {status !== 'approved' && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Profil-Vollständigkeit</h4>
          
          {isValid ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Profil ist vollständig und bereit für Freigabe</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Profil ist unvollständig</span>
              </div>
              <ul className="ml-6 text-sm text-gray-600">
                {missingFields.map((field, index) => (
                  <li key={index} className="list-disc">
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {status !== 'approved' && isValid && (
        <div className="border-t pt-4">
          <Button
            onClick={handleRequestApproval}
            disabled={isRequesting || status === 'pending'}
            className="w-full"
            variant={status === 'pending' ? 'secondary' : 'primary'}
          >
            {isRequesting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Wird angefordert...</span>
              </div>
            ) : status === 'pending' ? (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Freigabe bereits angefordert</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Profil zur Freigabe anmelden</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Info für abgelehnte Profile */}
      {status === 'rejected' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Ihr Profil wurde abgelehnt. Bitte überarbeiten Sie die fehlenden Informationen und melden Sie sich erneut zur Freigabe an.
          </p>
        </div>
      )}
    </div>
  )
}
