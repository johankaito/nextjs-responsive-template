import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeDate, formatFileSize, cn, getBaseUrl } from '../utils';

describe('formatRelativeDate', () => {
  beforeEach(() => {
    // Mock the current date
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Today" for current date', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    expect(formatRelativeDate(now)).toBe('Today');
  });

  it('should return "Yesterday" for 1 day ago', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    const yesterday = new Date('2024-01-14T12:00:00Z');
    
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('should pluralize days correctly', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    expect(formatRelativeDate(new Date('2024-01-13T12:00:00Z'))).toBe('2 days ago');
    expect(formatRelativeDate(new Date('2024-01-10T12:00:00Z'))).toBe('5 days ago');
  });

  it('should pluralize weeks correctly', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    // 1 week ago
    expect(formatRelativeDate(new Date('2024-01-08T12:00:00Z'))).toBe('1 week ago');
    // 2 weeks ago
    expect(formatRelativeDate(new Date('2024-01-01T12:00:00Z'))).toBe('2 weeks ago');
    // 3 weeks ago
    expect(formatRelativeDate(new Date('2023-12-25T12:00:00Z'))).toBe('3 weeks ago');
  });

  it('should pluralize months correctly', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    // 1 month ago
    expect(formatRelativeDate(new Date('2023-12-15T12:00:00Z'))).toBe('1 month ago');
    // 2 months ago
    expect(formatRelativeDate(new Date('2023-11-15T12:00:00Z'))).toBe('2 months ago');
    // 6 months ago
    expect(formatRelativeDate(new Date('2023-07-15T12:00:00Z'))).toBe('6 months ago');
  });

  it('should pluralize years correctly', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    // 1 year ago
    expect(formatRelativeDate(new Date('2023-01-15T12:00:00Z'))).toBe('1 year ago');
    // 2 years ago
    expect(formatRelativeDate(new Date('2022-01-15T12:00:00Z'))).toBe('2 years ago');
  });

  it('should handle string dates', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    
    expect(formatRelativeDate('2024-01-14T12:00:00Z')).toBe('Yesterday');
    expect(formatRelativeDate('2024-01-08T12:00:00Z')).toBe('1 week ago');
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(100)).toBe('100 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  it('should format KB correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 * 100)).toBe('100 KB');
  });

  it('should format MB correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1024 * 1024 * 5.5)).toBe('5.5 MB');
  });

  it('should format GB correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    expect(formatFileSize(1024 * 1024 * 1024 * 2.25)).toBe('2.25 GB');
  });
});

describe('cn', () => {
  it('should combine class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should filter out falsy values', () => {
    expect(cn('class1', null, undefined, false, '', 'class2')).toBe('class1 class2');
  });
});

describe('getBaseUrl', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // @ts-expect-error - mocking window
    delete global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should return default URL on server', () => {
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });

  it('should return localhost URL in development', () => {
    global.window = {
      location: {
        hostname: 'localhost',
        port: '3000',
        protocol: 'http:',
        // Add required properties
        href: 'http://localhost:3000',
        host: 'localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        origin: 'http://localhost:3000',
        ancestorOrigins: {} as DOMStringList,
        assign: () => {},
        reload: () => {},
        replace: () => {}
      } as Location
    } as Window & typeof globalThis;
    
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });

  it('should return production URL', () => {
    global.window = {
      location: {
        hostname: 'app.tofilgroup.com',
        port: '',
        protocol: 'https:',
        // Add required properties
        href: 'https://app.tofilgroup.com',
        host: 'app.tofilgroup.com',
        pathname: '/',
        search: '',
        hash: '',
        origin: 'https://app.tofilgroup.com',
        ancestorOrigins: {} as DOMStringList,
        assign: () => {},
        reload: () => {},
        replace: () => {}
      } as Location
    } as Window & typeof globalThis;
    
    expect(getBaseUrl()).toBe('https://app.tofilgroup.com');
  });

  it('should handle non-standard ports', () => {
    global.window = {
      location: {
        hostname: 'example.com',
        port: '8080',
        protocol: 'https:',
        // Add required properties
        href: 'https://example.com:8080',
        host: 'example.com:8080',
        pathname: '/',
        search: '',
        hash: '',
        origin: 'https://example.com:8080',
        ancestorOrigins: {} as DOMStringList,
        assign: () => {},
        reload: () => {},
        replace: () => {}
      } as Location
    } as Window & typeof globalThis;
    
    expect(getBaseUrl()).toBe('https://example.com:8080');
  });
});