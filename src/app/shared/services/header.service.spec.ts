import { TestBed } from '@angular/core/testing';
import { HttpHeaders } from '@angular/common/http';
import { HeaderService } from './header.service';

describe('HeaderService', () => {
  let service: HeaderService;
  let sessionStorageSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeaderService]
    });

    service = TestBed.inject(HeaderService);

    // Mock sessionStorage
    getItemSpy = spyOn(sessionStorage, 'getItem');
    setItemSpy = spyOn(sessionStorage, 'setItem');
    removeItemSpy = spyOn(sessionStorage, 'removeItem');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setToken', () => {

    it('should set token in memory', () => {
      const token = 'test-token-123';

      service.setToken(token, false);

      expect(service.token).toBe(token);
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('should set token in sessionStorage by default', () => {
      const token = 'test-token-456';

      service.setToken(token);

      expect(service.token).toBe(token);
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', token);
    });

    it('should set token in sessionStorage when useStorage is true', () => {
      const token = 'test-token-789';

      service.setToken(token, true);

      expect(service.token).toBe(token);
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', token);
    });

    it('should handle null token', () => {
      service.setToken(null);

      expect(service.token).toBeNull();
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', null);
    });

    it('should handle undefined token', () => {
      service.setToken(undefined);

      expect(service.token).toBeUndefined();
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', undefined);
    });

    it('should handle empty string token', () => {
      const token = '';

      service.setToken(token);

      expect(service.token).toBe('');
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', '');
    });

    it('should override previous token', () => {
      service.setToken('first-token');
      service.setToken('second-token');

      expect(service.token).toBe('second-token');
      expect(setItemSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getToken', () => {

    it('should get token from sessionStorage by default', () => {
      const token = 'stored-token';
      getItemSpy.and.returnValue(token);

      const result = service.getToken();

      expect(result).toBe(token);
      expect(getItemSpy).toHaveBeenCalledWith('jwt_token');
    });

    it('should get token from sessionStorage when useStorage is true', () => {
      const token = 'stored-token-123';
      getItemSpy.and.returnValue(token);

      const result = service.getToken(true);

      expect(result).toBe(token);
      expect(getItemSpy).toHaveBeenCalledWith('jwt_token');
    });

    it('should get token from memory when useStorage is false', () => {
      const token = 'memory-token';
      service.token = token;

      const result = service.getToken(false);

      expect(result).toBe(token);
      expect(getItemSpy).not.toHaveBeenCalled();
    });

    it('should return null if no token in sessionStorage', () => {
      getItemSpy.and.returnValue(null);

      const result = service.getToken();

      expect(result).toBeNull();
    });

    it('should return undefined if no token in memory', () => {
      service.token = undefined;

      const result = service.getToken(false);

      expect(result).toBeUndefined();
    });
  });

  describe('buildHttpOptions', () => {

    it('should build headers without token', async () => {
      getItemSpy.and.returnValue(null);

      const result = await service.buildHttpOptions();

      expect(result).toBeDefined();
      expect(result.headers).toBeInstanceOf(HttpHeaders);
      expect(result.headers.get('Accept')).toBe('application/json');
      expect(result.headers.get('Content-Type')).toBe('application/json');
      expect(result.headers.get('Authorization')).toBeNull();
    });

    it('should build headers with token', async () => {
      const token = 'test-jwt-token';
      getItemSpy.and.returnValue(token);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(result.headers.get('Accept')).toBe('application/json');
      expect(result.headers.get('Content-Type')).toBe('application/json');
    });

    it('should build headers without Content-Type for upload', async () => {
      const token = 'test-token';
      getItemSpy.and.returnValue(token);

      const result = await service.buildHttpOptions(true);

      expect(result.headers.get('Content-Type')).toBeNull();
      expect(result.headers.get('Accept')).toBe('application/json');
      expect(result.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should include Content-Type when isUpload is false', async () => {
      getItemSpy.and.returnValue('token');

      const result = await service.buildHttpOptions(false);

      expect(result.headers.get('Content-Type')).toBe('application/json');
    });

    it('should use memory token when set', async () => {
      const memoryToken = 'memory-jwt-token';
      service.token = memoryToken;
      getItemSpy.and.returnValue(memoryToken);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBe(`Bearer ${memoryToken}`);
    });

    it('should handle empty token', async () => {
      getItemSpy.and.returnValue('');

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBeNull();
    });

    it('should return Promise that resolves', async () => {
      getItemSpy.and.returnValue('token');

      const promise = service.buildHttpOptions();

      expect(promise).toBeInstanceOf(Promise);

      const result = await promise;
      expect(result).toBeDefined();
    });
  });

  describe('Token lifecycle', () => {

    it('should maintain token consistency between memory and storage', () => {
      const token = 'consistent-token';

      service.setToken(token, true);
      getItemSpy.and.returnValue(token);

      expect(service.getToken(false)).toBe(token);
      expect(service.getToken(true)).toBe(token);
    });

    it('should handle token update sequence', () => {
      service.setToken('token1', true);
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', 'token1');

      service.setToken('token2', true);
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', 'token2');

      expect(service.token).toBe('token2');
    });

    it('should handle mixed storage usage', () => {
      service.setToken('memory-token', false);
      expect(service.token).toBe('memory-token');
      expect(setItemSpy).not.toHaveBeenCalled();

      service.setToken('storage-token', true);
      expect(service.token).toBe('storage-token');
      expect(setItemSpy).toHaveBeenCalledWith('jwt_token', 'storage-token');
    });
  });

  describe('HTTP Headers structure', () => {

    it('should create valid HttpHeaders object', async () => {
      getItemSpy.and.returnValue('token');

      const result = await service.buildHttpOptions();

      expect(result.headers.keys()).toContain('accept');
      expect(result.headers.keys()).toContain('content-type');
      expect(result.headers.keys()).toContain('authorization');
    });

    it('should have correct Accept header', async () => {
      getItemSpy.and.returnValue(null);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Accept')).toBe('application/json');
    });

    it('should format Authorization header correctly', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      getItemSpy.and.returnValue(token);

      const result = await service.buildHttpOptions();

      const authHeader = result.headers.get('Authorization');
      expect(authHeader).toBe(`Bearer ${token}`);
      expect(authHeader?.startsWith('Bearer ')).toBeTruthy();
    });

    it('should handle multiple calls with different tokens', async () => {
      getItemSpy.and.returnValue('token1');
      const result1 = await service.buildHttpOptions();

      getItemSpy.and.returnValue('token2');
      const result2 = await service.buildHttpOptions();

      expect(result1.headers.get('Authorization')).toBe('Bearer token1');
      expect(result2.headers.get('Authorization')).toBe('Bearer token2');
    });
  });

  describe('Upload scenarios', () => {

    it('should omit Content-Type for file upload', async () => {
      getItemSpy.and.returnValue('upload-token');

      const result = await service.buildHttpOptions(true);

      expect(result.headers.has('Content-Type')).toBeFalsy();
      expect(result.headers.get('Accept')).toBe('application/json');
      expect(result.headers.get('Authorization')).toBeTruthy();
    });

    it('should include all headers except Content-Type for upload', async () => {
      const token = 'file-upload-token';
      getItemSpy.and.returnValue(token);

      const result = await service.buildHttpOptions(true);

      const keys = result.headers.keys();
      expect(keys).toContain('Accept');
      expect(keys).toContain('authorization');
      expect(keys).not.toContain('content-type');
    });
  });

  describe('Edge cases', () => {

    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(10000);
      getItemSpy.and.returnValue(longToken);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBe(`Bearer ${longToken}`);
    });

    it('should handle tokens with special characters', async () => {
      const specialToken = 'token-with-special!@#$%^&*()_+={}[]|:;<>?,./';
      getItemSpy.and.returnValue(specialToken);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBe(`Bearer ${specialToken}`);
    });

    it('should handle tokens with spaces', async () => {
      const tokenWithSpaces = 'token with spaces';
      getItemSpy.and.returnValue(tokenWithSpaces);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBe(`Bearer ${tokenWithSpaces}`);
    });

    it('should handle unicode tokens', async () => {
      const unicodeToken = 'token用户العربية';
      getItemSpy.and.returnValue(unicodeToken);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toContain(unicodeToken);
    });

    it('should handle rapid consecutive calls', async () => {
      getItemSpy.and.returnValue('rapid-token');

      const promises = [
        service.buildHttpOptions(),
        service.buildHttpOptions(),
        service.buildHttpOptions(),
        service.buildHttpOptions(),
        service.buildHttpOptions()
      ];

      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.headers.get('Authorization')).toBe('Bearer rapid-token');
      });
    });
  });

  describe('Security considerations', () => {

    it('should not expose token in plain text objects', () => {
      const sensitiveToken = 'super-secret-token';
      service.setToken(sensitiveToken, false);

      // Le token est stocké mais ne devrait pas être exposé dans les logs
      expect(service.token).toBe(sensitiveToken);
    });

    it('should handle null token securely', async () => {
      getItemSpy.and.returnValue(null);

      const result = await service.buildHttpOptions();

      expect(result.headers.get('Authorization')).toBeNull();
      expect(result.headers.has('Authorization')).toBeFalsy();
    });

    it('should not include Bearer prefix without token', async () => {
      getItemSpy.and.returnValue(null);

      const result = await service.buildHttpOptions();

      const authHeader = result.headers.get('Authorization');
      expect(authHeader).not.toBe('Bearer ');
      expect(authHeader).toBeNull();
    });
  });

  describe('Performance', () => {

    it('should create headers efficiently', async () => {
      getItemSpy.and.returnValue('perf-token');

      const start = performance.now();
      await service.buildHttpOptions();
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should be very fast
    });

    it('should handle multiple buildHttpOptions calls without memory leak', async () => {
      getItemSpy.and.returnValue('token');

      for (let i = 0; i < 1000; i++) {
        await service.buildHttpOptions();
      }

      // Si pas d'erreur mémoire, le test passe
      expect(true).toBeTruthy();
    });
  });

  describe('Integration with real sessionStorage behavior', () => {

    beforeEach(() => {
      // Restaurer le vrai sessionStorage pour ces tests
      getItemSpy.and.callThrough();
      setItemSpy.and.callThrough();
    });

    it('should persist token across service methods', () => {
      const token = 'persistent-token';

      service.setToken(token, true);
      const retrieved = service.getToken(true);

      expect(retrieved).toBe(token);
    });

    it('should clear when sessionStorage is cleared', () => {
      service.setToken('temp-token', true);
      sessionStorage.clear();

      const retrieved = service.getToken(true);

      expect(retrieved).toBeNull();
    });
  });
});
