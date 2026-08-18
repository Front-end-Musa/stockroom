import { environment } from './environment';

describe('environment configuration', () => {
  it('uses a valid development API configuration in the test build', () => {
    expect(environment.production).toBe(false);
    expect(() => new URL(environment.apiUrl)).not.toThrow();
    expect(environment.apiUrl.endsWith('/')).toBe(false);
  });
});
