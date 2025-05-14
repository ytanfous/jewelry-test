// utils/serverPath.js
import path from 'path';
import getConfig from 'next/config';

const serverPath = (staticFilePath) => {
    const {serverRuntimeConfig} = getConfig();
    const {PROJECT_ROOT} = serverRuntimeConfig;

    if (!PROJECT_ROOT) {
        throw new Error('PROJECT_ROOT is not defined in serverRuntimeConfig');
    }

    return path.join(PROJECT_ROOT, staticFilePath);
};

export default serverPath;
