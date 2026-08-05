'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { createBill, isSubmitting, errorCode } = useCreateBill();

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedImage(event.target.files?.[0] ?? null);
  }

  function handleChooseAnotherImage() {
    setSelectedImage(null);

    if (inputRef.current) inputRef.current.value = '';

    inputRef.current?.click();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedImage) return;

    const billId = await createBill({ image: selectedImage });

    const hasSucceeded = Boolean(billId);

    if (hasSucceeded) onBillCreated({ billId: billId as string });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel border border-subtle rounded-3xl p-5">
      <label className="block font-body text-xs uppercase tracking-widest text-secondary mb-3">Foto da conta</label>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        className={
          previewUrl
            ? 'hidden'
            : 'w-full font-body text-sm text-secondary file:mr-3 file:border-0 file:rounded-lg file:bg-mint file:text-on-accent file:font-semibold file:px-3 file:py-1.5 file:text-sm'
        }
      />

      {previewUrl && (
        <div>
          <img
            src={previewUrl}
            alt="Pré-visualização da nota fiscal selecionada"
            className="w-full h-[70vh] sm:h-[28rem] object-contain rounded-2xl border border-subtle bg-panel-raised"
          />

          <button
            type="button"
            onClick={handleChooseAnotherImage}
            disabled={isSubmitting}
            className="mt-2 text-sm font-body text-secondary hover:text-primary disabled:opacity-60"
          >
            Escolher outra foto
          </button>
        </div>
      )}

      {errorCode && (
        <p className="mt-3 text-sm font-body text-negative">
          {UPLOAD_ERROR_MESSAGES[errorCode] ?? UPLOAD_ERROR_MESSAGES.unknown_error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedImage}
        className="mt-4 w-full bg-mint hover:bg-mint-mid text-on-accent font-body font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? 'Processando...' : 'Adicionar conta'}
      </button>
    </form>
  );
}