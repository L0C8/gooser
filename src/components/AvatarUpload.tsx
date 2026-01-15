import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarUploadProps {
  username: string;
  currentAvatarUrl: string;
  onUploadSuccess: () => void;
  onClose: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function AvatarUpload({ username, currentAvatarUrl, onUploadSuccess, onClose }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    if (!completedCrop) {
      setError('Please select a crop area');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      formData.append('username', username);

      // Send crop as pixel values relative to natural image dimensions
      if (imgRef.current && completedCrop) {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        const cropData = {
          x: Math.round(completedCrop.x * scaleX),
          y: Math.round(completedCrop.y * scaleY),
          width: Math.round(completedCrop.width * scaleX),
          height: Math.round(completedCrop.height * scaleY)
        };
        formData.append('crop', JSON.stringify(cropData));
      }

      const serverPort = 3001;
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${serverPort}/avatar/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onUploadSuccess();
        onClose();
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload avatar');
      console.error('Avatar upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload-overlay">
      <div className="avatar-upload-modal">
        <h3>Change Avatar</h3>

        <div className="current-avatar">
          <span>Current:</span>
          <img src={currentAvatarUrl} alt="Current avatar" />
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="file-input"
        />

        {previewUrl && (
          <div className="crop-container">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop={false}
            >
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Upload preview"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </ReactCrop>
          </div>
        )}

        {error && <div className="upload-error">{error}</div>}

        <div className="upload-buttons">
          <button onClick={onClose} disabled={uploading}>Cancel</button>
          <button onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
