import path from 'path';
import fs from 'fs/promises';

export class FileService {
  static parseJSONFile<T>(data: Buffer): T {
    const jsonString = data.toString();

    return JSON.parse(jsonString);
  }

  static async getLastFilePath(dirPath: string): Promise<string | null> {
    let dir: string[];

    try {
      dir = await fs.readdir(dirPath);
    } catch (e) {
      return null;
    }

    const length = dir.length;

    if (length === 0) {
      return null;
    }

    return path.join(dirPath, dir[length - 1]);
  }
}
