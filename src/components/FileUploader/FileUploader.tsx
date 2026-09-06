import React from "react";

interface FileUploaderProps {
  onFileSelectSuccess: (file: File) => void;
}

const FileUploader = ({ onFileSelectSuccess }: FileUploaderProps) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelectSuccess(file);
  };

  return (
    <div className="file-uploader">
      <input type="file" onChange={handleFileInput} />
    </div>
  );
};

export default FileUploader;