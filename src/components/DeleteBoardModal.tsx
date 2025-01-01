// import { useState } from "react";

interface DeleteBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  boardName: string;
}

export default function DeleteBoardModal({
  isOpen,
  onClose,
  onConfirm,
  boardName,
}: DeleteBoardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Board löschen</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sind Sie sicher, dass Sie das Board "{boardName}" löschen möchten?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
