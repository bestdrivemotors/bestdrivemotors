import { afterEach, describe, expect, it, vi } from 'vitest';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send(...args) { return sendMock(...args); }
  },
  PutObjectCommand: class {
    constructor(input) { this.input = input; }
  },
  DeleteObjectCommand: class {
    constructor(input) { this.input = input; }
  },
}));

afterEach(() => {
  vi.resetModules();
  sendMock.mockReset();
  delete process.env.R2_ACCOUNT_ID;
  delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY;
  delete process.env.R2_BUCKET_NAME;
  delete process.env.R2_PUBLIC_BASE_URL;
});

describe('putR2Object', () => {
  it('stores the object with its MIME type and returns its CDN URL', async () => {
    process.env.R2_ACCOUNT_ID = 'acct';
    process.env.R2_ACCESS_KEY_ID = 'key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'inventory';
    process.env.R2_PUBLIC_BASE_URL = 'https://cdn.example.com/';
    sendMock.mockResolvedValue({});

    const { putR2Object } = await import('@/lib/r2');
    const result = await putR2Object({
      key: 'vehicles/vehicle-1/car.webp',
      body: Buffer.from('webp'),
      contentType: 'image/webp',
    });

    expect(result).toEqual({
      key: 'vehicles/vehicle-1/car.webp',
      publicUrl: 'https://cdn.example.com/vehicles/vehicle-1/car.webp',
    });
    expect(sendMock.mock.calls[0][0].input).toMatchObject({
      Bucket: 'inventory',
      Key: 'vehicles/vehicle-1/car.webp',
      ContentType: 'image/webp',
    });
  });
});