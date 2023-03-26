import { File as MulterFile, Buffer } from 'multer';

export class MulterDiskUploadedFile implements MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
  destinationPath: string; // pole określające ścieżkę do celu
}