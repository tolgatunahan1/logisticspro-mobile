import { useState, useCallback } from "react";

/**
 * Custom hook for delete operations with modal confirmation
 * Separation of Concerns:
 * - Modal state management
 * - Delete logic encapsulation
 * - Logging and verification
 * - Reusable across all entity types
 */

interface DeleteOperationState<T> {
  isOpen: boolean;
  item: T | null;
  isDeleting: boolean;
}

interface UseDeleteOperationReturn<T> {
  deleteState: DeleteOperationState<T>;
  openDeleteConfirm: (item: T) => void;
  closeDeleteConfirm: () => void;
  confirmDelete: (onDelete: (item: T) => Promise<boolean>) => Promise<boolean>;
}

export function useDeleteOperation<T extends { id: string }>(
  entityType: "Carrier" | "Company" | "Job" | "IBAN"
): UseDeleteOperationReturn<T> {
  const [deleteState, setDeleteState] = useState<DeleteOperationState<T>>({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  const openDeleteConfirm = useCallback((item: T) => {
    console.log(`🗑️ [${entityType}] Delete confirm opened for:`, item.id);
    setDeleteState({
      isOpen: true,
      item,
      isDeleting: false,
    });
  }, [entityType]);

  const closeDeleteConfirm = useCallback(() => {
    console.log(`❌ [${entityType}] Delete cancelled`);
    setDeleteState({
      isOpen: false,
      item: null,
      isDeleting: false,
    });
  }, [entityType]);

  const confirmDelete = useCallback(
    async (onDelete: (item: T) => Promise<boolean>): Promise<boolean> => {
      if (!deleteState.item) return false;

      console.log(`🔴 [${entityType}] Delete operation starting...`);
      setDeleteState((prev) => ({ ...prev, isDeleting: true }));

      try {
        // Execute delete operation
        const success = await onDelete(deleteState.item);

        if (success) {
          console.log(`✅ [${entityType}] Delete successful for:`, deleteState.item.id);
          setDeleteState({
            isOpen: false,
            item: null,
            isDeleting: false,
          });
          return true;
        } else {
          console.error(`❌ [${entityType}] Delete failed for:`, deleteState.item.id);
          setDeleteState((prev) => ({ ...prev, isDeleting: false }));
          return false;
        }
      } catch (error) {
        console.error(`❌ [${entityType}] Delete error:`, error);
        setDeleteState((prev) => ({ ...prev, isDeleting: false }));
        return false;
      }
    },
    [deleteState.item, entityType]
  );

  return {
    deleteState,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
  };
}
