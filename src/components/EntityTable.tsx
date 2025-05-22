
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Edit, Eye } from "lucide-react";

type Column = {
  key: string;
  header: string;
};

type EntityTableProps = {
  columns: Column[];
  data: any[];
  entityType: "project" | "contractor" | "claim";
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const EntityTable = ({ columns, data, entityType, onView, onEdit, onDelete }: EntityTableProps) => {
  const typeColor = {
    project: "bg-blue-50 text-blue-700 border-blue-200",
    contractor: "bg-green-50 text-green-700 border-green-200",
    claim: "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No {entityType}s found
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={`${row.id}-${column.key}`}>
                    {column.key === "type" ? (
                      <Badge variant="outline" className={`${typeColor[row[column.key]]} capitalize`}>
                        {row[column.key]}
                      </Badge>
                    ) : (
                      <div className="line-clamp-1">{row[column.key]}</div>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => onView(row.id)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(row.id)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(row.id)} 
                        className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EntityTable;
