import { AuthGuardMiddleware } from './auth-guard.middleware';

describe('AuthGuardMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthGuardMiddleware()).toBeDefined();
  });
});
