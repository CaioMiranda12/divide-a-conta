'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  isConfirming,
  tone = 'neutral',
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel?: string;
  isConfirming: boolean;
  tone?: 'neutral' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDestructive = tone === 'destructive';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-panel border border-subtle rounded-3xl max-w-sm w-full p-5"
          >
            <h2 className="font-body text-lg font-semibold text-primary">{title}</h2>
            <p className="mt-2 font-body text-sm text-secondary">{description}</p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 border border-subtle text-primary font-body text-sm rounded-xl py-2 hover:bg-panel-raised"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isConfirming}
                className={`flex-1 font-body text-sm rounded-xl py-2 transition-colors disabled:opacity-60 ${
                  isDestructive
                    ? 'border border-negative text-negative hover:bg-negative/10'
                    : 'bg-mint hover:bg-mint-mid text-on-accent font-semibold'
                }`}
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