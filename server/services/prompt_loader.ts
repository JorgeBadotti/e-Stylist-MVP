import fs from 'fs/promises';
import path from 'path';

export const loadPrompt = async (filename: string, replacements: Record<string, string>) => {
    const filePath = path.join(process.cwd(), 'prompts', filename);
    let content = await fs.readFile(filePath, 'utf-8');

    for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return content;
};