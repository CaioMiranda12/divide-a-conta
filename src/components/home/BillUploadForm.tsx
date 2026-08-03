'use client';

import { useRef, useState } from 'react';
import { useCreateBill } from '@/hooks/useCreateBill';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/constants/upload';

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
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
        onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
      />

      {errorCode && <p>{UPLOAD_ERROR_MESSAGES[errorCode] ?? UPLOAD_ERROR_MESSAGES.unknown_error}</p>}

      <button type="submit" disabled={isSubmitting || !selectedImage}>
        {isSubmitting ? 'Processando...' : 'Criar conta'}
      </button>
    </form>
  );
}