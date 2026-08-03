'use client';

import { useRef, useState } from 'react';
import { useCreateBill } from '@/hooks/useCreateBill';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/constants/upload';
import { RECEIPT_TOP_EDGE_CLASS_NAME } from '@/utils/receiptEdgeClassName';

const UPLOAD_ERROR_MESSAGES: Record<string, string> = {
  image_required: 'Selecione uma imagem para continuar.',
  rate_limited: 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.',
  ocr_failed: 'Não conseguimos ler essa imagem. Tente uma foto mais nítida.',
  image_not_a_receipt: 'Essa imagem não parece ser uma nota fiscal.',
  unknown_error: 'Algo deu errado. Tente novamente.',
};

export function BillUploadForm({ onBillCreated }: { onBillCreated: (params: { billId: string }) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { createBill, isSubmitting, errorCode } = useCreateBill();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedImage) return;

    const billId = await createBill({ image: selectedImage });

    const hasSucceeded = Boolean(billId);

    if (hasSucceeded) onBillCreated({ billId: billId as string });
  }

  return (
    <form onSubmit={handleSubmit} className={`${RECEIPT_TOP_EDGE_CLASS_NAME} bg-paper border border-paper-line p-5`}>
      <label className="block font-body text-sm text-ink-muted mb-3">Foto da conta</label>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
        onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
        className="w-full font-body text-sm file:mr-3 file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-sm"
      />

      {errorCode && (
        <p className="mt-3 text-sm font-body text-stamp">
          {UPLOAD_ERROR_MESSAGES[errorCode] ?? UPLOAD_ERROR_MESSAGES.unknown_error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedImage}
        className="mt-4 w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? 'Processando...' : 'Adicionar conta'}
      </button>
    </form>
  );
}