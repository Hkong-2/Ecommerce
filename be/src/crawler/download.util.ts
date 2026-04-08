import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export async function downloadImage(
  url: string,
  destFolder: string,
): Promise<string | null> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
    });

    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(destFolder, filename);

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filename));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}
