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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Board löschen
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Sind Sie sicher, dass Sie das Board "{boardName}" löschen möchten?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="flex justify-end space-x-3">
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
