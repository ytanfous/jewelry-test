const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const obfuscateDir = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            obfuscateDir(filePath); // Recurse into subdirectories
        } else if (file.endsWith('.js')) {
            const code = fs.readFileSync(filePath, 'utf8');
            const obfuscated = JavaScriptObfuscator.obfuscate(code, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.75,
                numbersToExpressions: true,
                simplify: true,
                stringArray: true,
                stringArrayThreshold: 0.75,
            }).getObfuscatedCode();

            fs.writeFileSync(filePath, obfuscated);
        }
    });
};

obfuscateDir(path.join(__dirname, '.next'));