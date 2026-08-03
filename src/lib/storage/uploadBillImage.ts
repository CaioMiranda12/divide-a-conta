import { cloudinary } from '@/lib/storage/cloudinaryClient';
import { storageConfig } from '@/config/storage';

export async function uploadBillImage({
  image,
  userId,
}: {
  image: File;
  userId: string;
}): Promise<string> {
  const fileBuffer = Buffer.from(await image.arrayBuffer());

  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${storageConfig.folderName}/${userId}`,
        transformation: [{ width: storageConfig.maxImageWidthInPixels, crop: 'limit' }],
      },
      (error, result) => {
        const hasFailed = Boolean(error) || !result;

        if (hasFailed) {
          reject(error ?? new Error('Cloudinary upload returned no result'));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });

  return uploadResult.secure_url;
}