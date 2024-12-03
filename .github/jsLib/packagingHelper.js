import fs from 'fs';
import path from 'path';

export const produceFakeFilename = async (sizeMb = 82) => {
    try {
        const fileName = process.env.FILE_NAME;

        if (!fileName) {
            console.error('🔴 Error: FILE_NAME environment variable is not set.');
            process.exit(1);
        }

        // Create the ./packages directory if it doesn't exist
        const packagesDir = path.resolve('./packages');
        if (!fs.existsSync(packagesDir)) {
            fs.mkdirSync(packagesDir, {recursive: true});
        }

        // Generate a random file of sizeMb MB
        const filePath = path.join(packagesDir, fileName);
        const randomData = Buffer.alloc(sizeMb * 1024 * 1024); // 82 MB buffer
        fs.writeFileSync(filePath, randomData);

        console.log(`Preparing release file ${filePath} done:`);

        // List files in ./packages
        const files = fs.readdirSync(packagesDir).map(file => {
            const stats = fs.statSync(path.join(packagesDir, file));
            return `${file} - ${stats.size} bytes`;
        });

        console.log('Files in ./packages:');
        console.log(files.join('\n'));
    } catch (error) {
        console.error(`🔴 Error: ${error.message}`);
        process.exit(1);
    }
};
