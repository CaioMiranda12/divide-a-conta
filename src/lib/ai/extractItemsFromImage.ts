import { generateObject } from 'ai';
import { z } from 'zod';
import { ocrModel } from '@/lib/ai/client';
import { ocrConfig } from '@/config/ocr';

const extractedBillSchema = z.object({
  looksLikeReceipt: z.boolean(),
  restaurantName: z.string().nullable(),
  totalAmountInCents: z.number().int(),
  serviceFeePercent: z.number().int(),
  items: z
    .array(
      z.object({
        description: z.string(),
        priceInCents: z.number().int(),
        quantity: z.number().int(),
      }),
    )
    .max(ocrConfig.maxItemsExpected),
});

export type ExtractedBill = z.infer<typeof extractedBillSchema>;

export async function extractItemsFromImage({
  imageUrl,
}: {
  imageUrl: string;
}): Promise<ExtractedBill> {
  const { object } = await generateObject({
    model: ocrModel,
    schema: extractedBillSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analise esta imagem. Primeiro, avalie honestamente se ela é uma nota fiscal, cupom fiscal ou recibo de compra legível (campo looksLikeReceipt). Se não for — por exemplo, se for uma foto de outra coisa, um documento não relacionado, ou uma imagem sem texto de itens e preços — retorne looksLikeReceipt como false e os demais campos zerados ou vazios, sem inventar itens. Se for, extraia os itens, preços em centavos, nome do restaurante e taxa de serviço (se houver). Se um valor não estiver visível, retorne 0 ou null conforme o campo.',
          },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  });

  return object;
}