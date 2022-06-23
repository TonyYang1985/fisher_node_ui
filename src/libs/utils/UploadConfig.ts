export interface UploadConfig {
  maxFileSize: number;
  minioSSL: boolean;
  minioEndPoint: string;
  minioBucket: string;
  minioAccessURL: string;
  minioAccessKey: string;
  minioSecretKey: string;
}
