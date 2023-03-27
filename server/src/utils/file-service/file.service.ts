import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import { MulterDiskUploadedFile } from './multer-disk-uploaded-files';
import * as fs from 'fs'
import sharp from 'sharp'
import { promisify } from 'util';

@Injectable()
export class FileService {
  async saveFile(
    file: MulterDiskUploadedFile, 
    directory: string,
    filename: string
) {
    try {
        const writeFile = promisify(fs.writeFile)
        const newFilename = `${filename}.${file.mimetype.split('/')[1]}`
        const newPath = path.join(directory, newFilename)

        const resizedImage = await sharp(file.buffer).resize(128).toBuffer()

        await writeFile(newPath, resizedImage)
        return newPath
    } catch (e) {
        throw new InternalServerErrorException(`Could not save file: ${e.message}`)
    }
  }
}
