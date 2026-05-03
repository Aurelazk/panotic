import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.R2_REGION || 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME || 'panotic-uploads';
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const contentType = file.mimetype;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
