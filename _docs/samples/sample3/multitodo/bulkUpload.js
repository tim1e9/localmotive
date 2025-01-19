// This sample shows how to test handling a standard S3 event
// Instead of handling an actual S3 event, a developer can do the following:
// 1. Configure config.json appropriately to specify environment variables,
//    including the name of an s3 bucket and AWS credentials
// 2. Execute an "/_admin" command to Localmotive with a custom payload.
//    This payload will mimic the event sent to a Lambda function when a file
//    has been added to an S3 bucket.
// 3. The code will read the file from S3, parse it as a CSV file of bulk todo
//    updates, and perform a bulk update to the database.

import "@aws-sdk/crc64-nvme-crt"; // Why? Not sure.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createToDo } from "./dbservice.js";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
});

const getS3FileAsString = async (bucketName, fullPathAndFile ) => {
  try {
    const s3Command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fullPathAndFile
    });

    const response = await s3.send(s3Command);
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const contents = Buffer.concat(chunks).toString('utf-8');
    return contents;
  } catch(exc) {
    console.log(`ERROR: Cannot read S3 File: ${exc.message}`);
    return null;
  }
};

const persistBulkToDos = async (contents) => {
  // Assuming the first line is the column headers in this order: title, description, status
  const persistedEntries = [];
  const entries = contents.split("\n");
  for(let x=1; x < entries.length; x++) {
    const entry = entries[x].split(",");
    if (entry.length > 2) {
      const title = entry[0].slice(1,-1);
      const description = entry[1].slice(1,-1);
      const status = entry[2].slice(1,-1);
      const newToDo = {
        title: title,
        description: description,
        status: status
      }
      await createToDo(newToDo.title, newToDo.description, newToDo.status);
      persistedEntries.push(newToDo);
      }
  }
  return persistedEntries;
}

export const handler = async (event) => {

  // Extract the appropriate parts of the event
  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const fullPathAndFile = event.Records[0].s3.object.key;
    console.log(`About to retrieve S3 file ${fullPathAndFile} from bucket ${bucketName}...`);
    const contents = await getS3FileAsString(bucketName, fullPathAndFile);
    console.log(`File contents:${contents}`);

    const result = await persistBulkToDos(contents);

    return { statusCode: 200, body: JSON.stringify({entries: result})};
  } catch(exc) {
    return { statusCode: 500, body: JSON.stringify({err: exc.message})};
  }
};
