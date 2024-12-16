import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import * as unzipper from 'unzipper';


const extractZip = async (zipSourceDir, zipFilename, zipTargetDir) => {
  try {
    const zipSrcFile = path.join(zipSourceDir, zipFilename);
    const baseTargetDir = zipTargetDir ? zipTargetDir : os.tmpdir();
    const tempDir = path.join(baseTargetDir, `containertmp-${Date.now()}`);
    await fs.mkdir(tempDir);
    console.log(`Temp dir: ${tempDir}`);

    // Extract the zip file into the temp dir
    const zipSource = await unzipper.Open.file(zipSrcFile);
    await zipSource.extract({
        path: tempDir
    });
    return tempDir;
  } catch(exc) {
    console.error(`Exception extracting zip: ${exc.message}`);
    throw exc;
  }
};

export { extractZip }