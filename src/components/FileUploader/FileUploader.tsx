import React from "react";

interface FileUploaderProps {
  onFileSelectSuccess: (file: File) => void;
  onFileSelectError?: (error: { error: string }) => void;
}

const FileUploader = ({ onFileSelectSuccess, onFileSelectError }: FileUploaderProps) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelectSuccess(file);
    else if (onFileSelectError) onFileSelectError({ error: "No file selected" });
  };

  return (
    <div className="file-uploader">
      <input type="file" onChange={handleFileInput} />
    </div>
  );
};

export default FileUploader;