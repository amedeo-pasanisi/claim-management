
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { File, FolderOpen } from "lucide-react";
import { ContextFileRead } from "@/types/api";

type ContextFileSelectorProps = {
  title: string;
  description?: string;
  contextFiles: ContextFileRead[];
  selectedFiles: ContextFileRead[];
  onSelectionChange: (files: ContextFileRead[]) => void;
};

const ContextFileSelector = ({
  title,
  description,
  contextFiles,
  selectedFiles,
  onSelectionChange
}: ContextFileSelectorProps) => {
  const [internalSelection, setInternalSelection] = useState<ContextFileRead[]>(selectedFiles);

  useEffect(() => {
    setInternalSelection(selectedFiles);
  }, [selectedFiles]);

  const handleFileToggle = (file: ContextFileRead, checked: boolean) => {
    const newSelection = checked 
      ? [...internalSelection, file]
      : internalSelection.filter(f => f.id !== file.id);
    
    setInternalSelection(newSelection);
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? [...contextFiles] : [];
    setInternalSelection(newSelection);
    onSelectionChange(newSelection);
  };

  if (contextFiles.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-amber-600" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`select-all-${title}`}
              checked={internalSelection.length === contextFiles.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor={`select-all-${title}`} className="text-sm">
              Select All ({contextFiles.length})
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {contextFiles.map((file) => {
            const fileName = file.path.split('/').pop() || file.path;
            const isSelected = internalSelection.some(f => f.id === file.id);
            
            return (
              <div key={file.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                <Checkbox
                  id={`file-${file.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleFileToggle(file, checked as boolean)}
                />
                <File className="h-4 w-4 text-blue-600" />
                <Label htmlFor={`file-${file.id}`} className="text-sm flex-1 cursor-pointer">
                  {fileName}
                </Label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextFileSelector;
