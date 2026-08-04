import { prisma } from '@/lib/db/prisma';
import { uploadBillImage } from '@/lib/storage/uploadBillImage';
import { extractItemsFromImage } from '@/lib/ai/extractItemsFromImage';
import {
  ImageRequiredError,
  ImageNotAReceiptError,
  OcrFailedError,
} from '@/lib/errors/billErrors';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/constants/upload';

export async function createBill({
  userId,
  image,
}: {
  userId: string;
  image: unknown;
}): Promise<{ billId: string }> {
  const isFile = image instanceof File;

  if (!isFile) throw new ImageRequiredError();

  const isAcceptedMimeType = ACCEPTED_IMAGE_MIME_TYPES.includes(image.type);

  if (!isAcceptedMimeType) throw new ImageRequiredError();

  const imageUrl = await uploadBillImage({ image, userId });

  const bill = await prisma.bill.create({
    data: { userId, imageUrl, status: 'processing' },
  });

  const extractedBill = await extractItemsFromImage({ imageUrl }).catch(() => null);

  if (!extractedBill) {
    await prisma.bill.update({ where: { id: bill.id }, data: { status: 'failed' } });

    throw new OcrFailedError();
  }

  if (!extractedBill.looksLikeReceipt) {
    await prisma.bill.update({ where: { id: bill.id }, data: { status: 'failed' } });

    throw new ImageNotAReceiptError();
  }

  await prisma.bill.update({
    where: { id: bill.id },
    data: {
      status: 'draft',
      restaurantName: extractedBill.restaurantName,
      totalAmountInCents: extractedBill.totalAmountInCents,
      serviceFeePercent: extractedBill.serviceFeePercent,
      items: {
        create: extractedBill.items.map((item) => ({
          description: item.description,
          priceInCents: item.priceInCents,
          quantity: item.quantity,
        })),
      },
    },
  });

  return { billId: bill.id };
}