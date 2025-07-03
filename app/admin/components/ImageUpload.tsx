"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: (success: boolean) => void;
}

export default function ImageUpload({ value, onChange, onUploadStart, onUploadEnd }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload file');
      
      const data = await res.json();
      if (typeof onChange === 'function') onChange(data.url);
      setPreview(data.url);
      if (onUploadEnd) onUploadEnd(true);

    } catch (err: any) {
      setError(err.message || 'Upload failed');
      if (onUploadEnd) onUploadEnd(false);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onUploadStart, onUploadEnd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Загрузка...</p>
        ) : isDragActive ? (
          <p>Отпустите файл...</p>
        ) : (
          <p>Перетащите фото сюда или кликните для выбора</p>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {(preview || value) && (
        <div className="mt-4">
          <img src={preview || value} alt="preview" className="w-32 h-32 object-cover rounded-lg border" />
        </div>
      )}
    </div>
  );
} 