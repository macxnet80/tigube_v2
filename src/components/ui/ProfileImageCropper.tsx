import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, Save, Move, User, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Button from './Button';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface ProfileImageCropperProps {
  photoUrl?: string;
  onImageSave: (croppedImageUrl: string) => Promise<void>;
  uploading?: boolean;
  error?: string | null;
  className?: string;
  infoText?: string;
}

function ProfileImageCropper({
  photoUrl,
  onImageSave,
  uploading = false,
  error = null,
  className = "",
  infoText
}: ProfileImageCropperProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(photoUrl || null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update selectedImage when photoUrl changes
  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    if (!photoUrl) {
      setSelectedImage(null);
      return;
    }

    if (/^https?:\/\//i.test(photoUrl)) {
      fetch(photoUrl, { mode: 'cors' })
        .then(async (resp) => {
          const blob = await resp.blob();
          const localUrl = URL.createObjectURL(blob);
          objectUrlToRevoke = localUrl;
          setSelectedImage(localUrl);
        })
        .catch(() => {
          setSelectedImage(photoUrl);
        });
    } else {
      setSelectedImage(photoUrl);
    }

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [photoUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsEditing(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading || isSaving,
  });

  const onCropComplete = useCallback((_showCroppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return '';
    }

    const rotRad = (rotation * Math.PI) / 180;
    const { width: bWidth, height: bHeight } = {
      width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
      height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
    };

    canvas.width = bWidth;
    canvas.height = bHeight;

    ctx.translate(bWidth / 2, bHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(data, 0, 0);

    return canvas.toDataURL('image/jpeg');
  };

  const handleSave = async () => {
    try {
      if (!selectedImage || !croppedAreaPixels) return;

      setIsSaving(true);
      const croppedImage = await getCroppedImg(
        selectedImage,
        croppedAreaPixels,
        rotation
      );
      await onImageSave(croppedImage);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!photoUrl) {
      setSelectedImage(null);
    } else {
      setSelectedImage(photoUrl);
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const displayImage = selectedImage || photoUrl;

  if (isEditing && selectedImage) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="relative h-96 w-full bg-gray-900 rounded-xl overflow-hidden shadow-inner">
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            showGrid={true}
            cropShape="rect"
            objectFit="contain"
          />
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <ZoomOut className="h-5 w-5 text-gray-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
              />
              <ZoomIn className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleRotate}
                title="Drehen"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Drehen
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                title="Zurücksetzen"
                className="flex items-center gap-2"
              >
                <Move className="h-4 w-4" />
                Zurücksetzen
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6"
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!croppedAreaPixels || isSaving}
              isLoading={isSaving}
              className="px-8 shadow-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl">
        <div className="flex gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
            <Info className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-sm text-primary-900 leading-relaxed whitespace-pre-wrap">
            {infoText || "Lass uns dein Profilbild zum Strahlen bringen! Ein freundliches Foto schafft Vertrauen und macht dein Profil für Tierhalter direkt attraktiver."}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center max-w-2xl mx-auto space-y-6">
        <div className="w-full flex flex-col gap-6">
          <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 ${!displayImage ? 'min-h-[260px]' : 'min-h-[320px]'}`}>
            {displayImage ? (
              <div className="relative">
                <img
                  src={displayImage}
                  alt="Profilbild"
                  className="h-60 w-60 object-cover rounded-2xl border-4 border-white shadow-xl"
                />
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-2 right-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3 shadow-lg transition-colors"
                  title="Bild bearbeiten"
                  disabled={uploading}
                >
                  <Move className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <User className="h-14 w-14 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500">Noch kein Foto</p>
                <p className="text-sm text-gray-400 mt-1">Lade dein erstes Bild hoch.</p>
              </div>
            )}
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${isDragActive
              ? 'border-primary-500 bg-primary-50 scale-[1.02]'
              : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-5'
              } ${(uploading || isSaving) ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-2">
              <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {displayImage ? 'Bild ändern' : 'Bild hochladen'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Ziehen oder klicken</p>
              </div>
            </div>

            {(uploading || isSaving) && (
              <div className="mt-4 w-full max-w-[160px]">
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div className="bg-primary-600 h-full animate-[progress_2s_ease-in-out_infinite] w-1/3 origin-left"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default ProfileImageCropper;