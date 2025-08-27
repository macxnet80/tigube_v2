import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, X, Send, Upload, Image, Trash2, Plus } from 'lucide-react';
import Button from './Button';
import { supabase } from '../../lib/supabase/client';

interface FeedbackImage {
  file: File;
  preview?: string;
  uploadedUrl?: string;
}

interface FeedbackFormData {
  name: string;
  title: string;
  description: string;
  images: FeedbackImage[];
}

interface FeedbackMetadata {
  url: string;
  userAgent: string;
  timestamp: string;
  viewport: {
    width: number;
    height: number;
  };
  referrer: string;
}

function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    title: '',
    description: '',
    images: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function to restore scroll
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const getBrowserName = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unbekannt';
  };

  const collectMetadata = (): FeedbackMetadata => {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer
    };
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `feedback_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('feedback-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Supabase upload error:', error);
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('feedback-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Das Bild ist zu groß. Bitte wählen Sie ein Bild unter 5MB.');
        return;
      }
      
      // Check if we already have too many images
      if (formData.images.length >= 5) {
        alert('Sie können maximal 5 Bilder hochladen.');
        return;
      }
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      // Add to images array
      const newImage: FeedbackImage = { file, preview };
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, newImage] 
      }));
    } else {
      alert('Bitte wählen Sie eine gültige Bilddatei aus.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        handleImageUpload(file);
      });
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file);
            e.preventDefault();
          }
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      // Clean up preview URL
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const uploadAllImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of formData.images) {
      if (!image.uploadedUrl) {
        const url = await uploadImageToSupabase(image.file);
        if (url) {
          uploadedUrls.push(url);
        }
      } else {
        uploadedUrls.push(image.uploadedUrl);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Bitte geben Sie Ihren Namen ein.');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Bitte geben Sie eine Beschreibung ein.');
      return;
    }
    
    setIsSubmitting(true);
    setIsUploadingImages(true);

    try {
      const metadata = collectMetadata();
      let imageUrls: string[] = [];
      
      // Upload all images to Supabase if they exist
      if (formData.images.length > 0) {
        console.log('📸 Lade Bilder zu Supabase hoch...');
        imageUrls = await uploadAllImages();
        console.log('✅ Bilder erfolgreich hochgeladen:', imageUrls);
      }
      
      // Format data for Notion API compatibility
      const payload = {
        properties: {
          "Headline": {
            title: [
              {
                text: {
                  content: formData.title
                }
              }
            ]
          },
          "Aufgabenbezeichnung": {
            rich_text: [
              {
                text: {
                  content: `👤 Name: ${formData.name}\n\n📝 Beschreibung:\n${formData.description}\n\n🔗 Seite: ${metadata.url}\n\n🌐 Browser: ${getBrowserName(metadata.userAgent)}\n\n📱 Auflösung: ${metadata.viewport.width}x${metadata.viewport.height}\n\n⏰ Zeitpunkt: ${new Date(metadata.timestamp).toLocaleString('de-DE')}\n\n📸 Bilder: ${imageUrls.length > 0 ? imageUrls.join('\n') : 'Keine Bilder'}`
                }
              }
            ]
          },
          "Name": {
            rich_text: [
              {
                text: {
                  content: formData.name
                }
              }
            ]
          },
          "URL": {
            url: metadata.url
          },
          "Browser": {
            rich_text: [
              {
                text: {
                  content: `${getBrowserName(metadata.userAgent)} (${metadata.userAgent})`
                }
              }
            ]
          },
          "Viewport": {
            rich_text: [
              {
                text: {
                  content: `${metadata.viewport.width} × ${metadata.viewport.height} Pixel`
                }
              }
            ]
          },
          "Timestamp": {
            rich_text: [
              {
                text: {
                  content: `${new Date(metadata.timestamp).toLocaleString('de-DE')} (${metadata.timestamp})`
                }
              }
            ]
          },
          "Image": {
            rich_text: [
              {
                text: {
                  content: imageUrls.length > 0 ? imageUrls.join('\n') : "Keine Bilder hochgeladen"
                }
              }
            ]
          }
        }
      };

      console.log('Sending Notion-formatted payload:', payload);
      
      // Try webhook endpoint
      const webhookUrl = 'https://auto.macario.dev/webhook/29178425-3791-4ebb-be17-d07b9ad52f66';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Feedback erfolgreich gesendet!');
        setIsSuccess(true);
        
        // Reset form and clean up preview URLs
        formData.images.forEach(image => {
          if (image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
        
        setFormData({
          name: '',
          title: '',
          description: '',
          images: []
        });
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
        }, 3000);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('❌ Fehler beim Senden des Feedbacks:', error);
      
      // Fallback: Log to console for debugging
      console.log('📋 Feedback-Daten (Fallback):', {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        imageCount: formData.images.length,
        metadata: collectMetadata()
      });
      
      alert('Es gab einen Fehler beim Senden des Feedbacks. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  const handleInputChange = (field: keyof Omit<FeedbackFormData, 'images'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-l-lg shadow-lg transition-all duration-200 hover:shadow-xl group"
        title="Feedback senden"
      >
        <Lightbulb size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="text-orange-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Feedback senden</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="p-6 text-center">
                <div className="text-green-600 text-lg font-medium mb-2">
                  ✅ Feedback erfolgreich gesendet!
                </div>
                <p className="text-gray-600">
                  Vielen Dank für Ihr Feedback. Dieses Fenster schließt sich automatisch.
                </p>
              </div>
            )}

            {/* Form */}
            {!isSuccess && (
              <form onSubmit={handleSubmit} className="p-6" onPaste={handlePaste}>
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="feedback-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ihr Name"
                      required
                    />
                  </div>

                  {/* Title Field */}
                  <div>
                    <label htmlFor="feedback-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Titel <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="feedback-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Kurze Beschreibung des Problems/Vorschlags"
                      required
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label htmlFor="feedback-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Beschreibung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="feedback-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Detaillierte Beschreibung..."
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Screenshots oder Bilder (optional)
                    </label>
                    <div className="space-y-3">
                      {/* Upload Button */}
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={isUploadingImages || formData.images.length >= 5}
                        >
                          <Plus size={16} />
                          {isUploadingImages ? 'Lädt hoch...' : 'Bilder auswählen'}
                        </Button>
                        <span className="text-sm text-gray-500">
                          oder Strg+V zum Einfügen
                        </span>
                      </div>

                      {/* Image Counter */}
                      {formData.images.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {formData.images.length} von 5 Bildern ausgewählt
                        </div>
                      )}

                      {/* Image Previews */}
                      {formData.images.length > 0 && (
                        <div className="space-y-2">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Image size={16} className="text-gray-500" />
                                  <span className="text-sm text-gray-700">
                                    {image.file.name} ({Math.round(image.file.size / 1024)}KB)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              {/* Image Preview */}
                              {image.preview && (
                                <div className="mt-2">
                                  <img
                                    src={image.preview}
                                    alt="Vorschau"
                                    className="max-w-full h-32 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Unterstützte Formate: JPG, PNG, GIF (max. 5MB pro Bild, max. 5 Bilder)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploadingImages}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Feedback senden
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  <span className="text-red-500">*</span> Pflichtfelder
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FeedbackForm; 