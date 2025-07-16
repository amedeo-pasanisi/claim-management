
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Upload, X, File } from "lucide-react";

type SingleFileUploaderProps = {
  title: string;
  description?: string;
  file: File | null;
  setFile: (file: File | null) => void;
  required?: boolean;
};

const SingleFileUploader = ({
  title,
  description,
  file,
  setFile,
  required = false
}: SingleFileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {title} {required && <span className="text-red-500">*</span>}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors
            ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <div className="mb-2">
            <Label htmlFor="singleFileUpload" className="cursor-pointer text-blue-600 hover:text-blue-800">
              Click to upload
            </Label>{" "}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)
          </p>
          <input
            id="singleFileUpload"
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        {file && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Uploaded File</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-blue-600 mr-2" />
                  <div className="text-sm truncate max-w-[250px]">{file.name}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-red-600"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SingleFileUploader;
