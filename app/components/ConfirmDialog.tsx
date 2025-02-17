interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg p-6 max-w-sm w-full mx-4">
        <p className="text-xl text-center mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            onClick={onConfirm}
          >
            Sí
          </button>
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
} 