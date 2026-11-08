import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

let client;

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const config = {
    accountId,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  };
  if (Object.values(config).some((value) => !value)) {
    throw new Error('Cloudflare R2 is not configured. Set all R2_* variables.');
  }
  return config;
}

function getClient(config) {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

export function getR2PublicUrl(key) {
  const { publicBaseUrl } = getR2Config();
  const path = String(key).split('/').map(encodeURIComponent).join('/');
  return new URL(path, `${publicBaseUrl.replace(/\/+$/, '')}/`).toString();
}

export async function putR2Object({ key, body, contentType }) {
  const config = getR2Config();
  await getClient(config).send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return { key, publicUrl: getR2PublicUrl(key) };
}

export async function deleteR2Object(key) {
  const config = getR2Config();
  await getClient(config).send(new DeleteObjectCommand({ Bucket: config.bucketName, Key: key }));
}