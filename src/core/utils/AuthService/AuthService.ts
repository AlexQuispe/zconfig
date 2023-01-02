import crypto from 'crypto';

export class AuthService {
  static md5(str: string) {
    return crypto
      .createHash('md5')
      .update(str + '')
      .digest('hex');
  }
}
