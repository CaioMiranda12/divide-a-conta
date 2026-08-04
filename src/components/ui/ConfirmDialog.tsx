'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  isConfirming,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel?: string;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-paper border border-paper-line max-w-sm w-full p-5"
          >
            <h2 className="font-display text-lg tracking-wide">{title}</h2>
            <p className="mt-2 font-body text-sm text-ink-muted">{description}</p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 border border-paper-line text-ink font-body text-sm py-2 hover:bg-ink/5"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isConfirming}
                className="flex-1 bg-stamp hover:bg-stamp-dark text-paper font-body text-sm py-2 disabled:opacity-60"
              >
                {isConfirming ? (confirmingLabel ?? 'Aguarde...') : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}