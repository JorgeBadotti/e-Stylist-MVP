import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadPrompt = async (filename, replacements) => {
    const filePath = path.join(__dirname, '..', 'Prompts', filename);
    let content = await fs.readFile(filePath, 'utf-8');

    for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return content;
};