
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
import { Upload, X, File, Trash } from "lucide-react";

type ContextFileUploaderProps = {
  title: string;
  description?: string;
  contextFiles: File[];
  setContextFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const ContextFileUploader = ({
  title,
  description,
  contextFiles,
  setContextFiles
}: ContextFileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setContextFiles((prev) => [...prev, ...newFiles]);
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
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setContextFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setContextFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
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
            <Label htmlFor="fileUpload" className="cursor-pointer text-blue-600 hover:text-blue-800">
              Click to upload
            </Label>{" "}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB each)
          </p>
          <input
            id="fileUpload"
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {contextFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Uploaded Files ({contextFiles.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {contextFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                >
                  <div className="flex items-center">
                    <File className="h-4 w-4 text-blue-600 mr-2" />
                    <div className="text-sm truncate max-w-[250px]">{file.name}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-red-600"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setContextFiles([])}
            >
              <Trash className="h-4 w-4 mr-1" /> Remove All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContextFileUploader;
