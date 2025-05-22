
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";

type ConfirmDeleteDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  entityType: string;
  entityName: string;
  onConfirm: () => void;
  cascadeMessage?: string;
};

const ConfirmDeleteDialog = ({
  isOpen,
  setIsOpen,
  entityType,
  entityName,
  onConfirm,
  cascadeMessage,
}: ConfirmDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Trash className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle>Delete {entityType}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Are you sure you want to delete <span className="font-medium text-gray-900">{entityName}</span>?
            {cascadeMessage && (
              <p className="mt-2 text-amber-600">
                {cascadeMessage}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
