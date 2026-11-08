import { afterEach, describe, expect, it, vi } from 'vitest';

const { sendMailMock, createTransportMock } = vi.hoisted(() => ({
  sendMailMock: vi.fn(),
  createTransportMock: vi.fn(),
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: createTransportMock },
}));

afterEach(() => {
  vi.resetModules();
  sendMailMock.mockReset();
  createTransportMock.mockReset();
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.EMAIL_FROM;
});

describe('sendAdminOtp', () => {
  it('sends a sign-in code through the configured SMTP transport', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASS = 'smtp-secret';
    process.env.EMAIL_FROM = 'Best Drive Motors <mailer@example.com>';
    createTransportMock.mockReturnValue({ sendMail: sendMailMock });
    sendMailMock.mockResolvedValue({ messageId: 'message-1' });

    const { sendAdminOtp } = await import('@/lib/email/send');
    await sendAdminOtp('staff@example.com', '123456', 'sign-in');

    expect(createTransportMock).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
    }));
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'staff@example.com',
      from: 'Best Drive Motors <mailer@example.com>',
      subject: expect.stringMatching(/code/i),
      text: expect.stringContaining('123456'),
    }));
  });
});