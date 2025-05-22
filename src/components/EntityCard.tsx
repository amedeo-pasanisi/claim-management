
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Trash, Edit, Eye } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type EntityCardProps = {
  id: string;
  title: string;
  type: "project" | "contractor" | "claim";
  metadata: string[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const EntityCard = ({ id, title, type, metadata, onView, onEdit, onDelete }: EntityCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeColor = {
    project: "bg-blue-50 text-blue-700 border-blue-200",
    contractor: "bg-green-50 text-green-700 border-green-200",
    claim: "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <Card 
      className={`transition-all duration-200 ${isHovered ? "shadow-md" : "shadow"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={`${typeColor[type]} capitalize`}>
            {type}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => onView(id)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(id)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(id)} 
                className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg mt-1 line-clamp-1" title={title}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {metadata.map((item, index) => (
          <div key={index} className="text-sm text-gray-500 mb-1 line-clamp-1">
            {item}
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => onView(id)}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EntityCard;
