import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  bucketName: string;
  folder?: string;
  className?: string;
  maxSizeMB?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  bucketName,
  folder = '',
  className = '',
  maxSizeMB = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Überprüfe Dateigröße
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Datei ist zu groß. Maximum: ${maxSizeMB}MB`;
    }

    // Überprüfe Dateityp
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Nur Bilddateien sind erlaubt (JPEG, PNG, WebP, GIF)';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Generiere eindeutigen Dateinamen
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Upload zu Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Hole die öffentliche URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        onImageUploaded(urlData.publicUrl);
      } else {
        throw new Error('Fehler beim Abrufen der Bild-URL');
      }
    } catch (error) {
      console.error('Upload-Fehler:', error);
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler beim Upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onImageUploaded('');
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Vorschau"
            className="w-full h-32 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="space-y-2">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {uploading ? 'Wird hochgeladen...' : 'Bild auswählen'}
              </button>
              <p className="text-sm text-gray-500 mt-1">
                oder per Drag & Drop hier ablegen
              </p>
            </div>
            <p className="text-xs text-gray-400">
              JPEG, PNG, WebP, GIF - Max. {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;