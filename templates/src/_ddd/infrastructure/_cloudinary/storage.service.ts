import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(file: Express.Multer.File, folder = 'uploads'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const publicId = `${folder}/${randomUUID()}`;
      cloudinary.uploader
        .upload_stream({ public_id: publicId, resource_type: 'auto' }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  getUrl(publicId: string): string {
    return cloudinary.url(publicId);
  }
}
