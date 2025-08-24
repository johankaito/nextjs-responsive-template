import { describe, it, expect } from 'vitest';
import { 
  userKeys, 
  locationKeys, 
  jobKeys,
  fileKeys,
  contractorKeys,
  notificationKeys,
} from '../queryKeys';

describe('Query Key Factory', () => {
  describe('Hierarchical Structure', () => {
    it('should create hierarchical user keys', () => {
      expect(userKeys.all()).toEqual(['users']);
      expect(userKeys.lists()).toEqual(['users', 'list']);
      expect(userKeys.list()).toEqual(['users', 'list']);
      expect(userKeys.list({ type: 'OWNER' })).toEqual(['users', 'list', { type: 'OWNER' }]);
      expect(userKeys.details()).toEqual(['users', 'detail']);
      expect(userKeys.detail('123')).toEqual(['users', 'detail', '123']);
      expect(userKeys.byType('CONTRACTOR')).toEqual(['users', 'list', { type: 'CONTRACTOR' }]);
    });

    it('should create hierarchical location keys', () => {
      expect(locationKeys.all()).toEqual(['locations']);
      expect(locationKeys.lists()).toEqual(['locations', 'list']);
      expect(locationKeys.list()).toEqual(['locations', 'list']);
      expect(locationKeys.list({ city: 'NYC' })).toEqual(['locations', 'list', { city: 'NYC' }]);
      expect(locationKeys.details()).toEqual(['locations', 'detail']);
      expect(locationKeys.detail('456')).toEqual(['locations', 'detail', '456']);
    });

    it('should create hierarchical job keys', () => {
      expect(jobKeys.all()).toEqual(['jobs']);
      expect(jobKeys.lists()).toEqual(['jobs', 'list']);
      expect(jobKeys.list()).toEqual(['jobs', 'list']);
      expect(jobKeys.list({ status: 'ACTIVE' })).toEqual(['jobs', 'list', { status: 'ACTIVE' }]);
      expect(jobKeys.list({ status: 'ACTIVE' }, 'CONTRACTOR')).toEqual(['jobs', 'list', { status: 'ACTIVE' }, 'CONTRACTOR']);
      expect(jobKeys.details()).toEqual(['jobs', 'detail']);
      expect(jobKeys.detail('789')).toEqual(['jobs', 'detail', '789']);
      expect(jobKeys.history('789')).toEqual(['job-history', '789']);
      expect(jobKeys.history('789', 'CONTRACTOR')).toEqual(['job-history', '789', 'CONTRACTOR']);
    });
  });

  describe('Special Keys', () => {
    it('should create contractor-specific keys', () => {
      expect(contractorKeys.documents()).toEqual(['contractor-documents']);
      expect(contractorKeys.documents('user123')).toEqual(['contractor-documents', 'user123']);
      expect(contractorKeys.profile('user456')).toEqual(['contractor-profile', 'user456']);
    });

    it('should create notification keys', () => {
      expect(notificationKeys.all()).toEqual(['notifications']);
      expect(notificationKeys.all('user123')).toEqual(['notifications', 'user123']);
      expect(notificationKeys.unread()).toEqual(['notifications-unread']);
      expect(notificationKeys.unread('user123')).toEqual(['notifications-unread', 'user123']);
    });
  });

  describe('Type Safety', () => {
    it('should return consistent types', () => {
      const keys = userKeys.all();
      expect(Array.isArray(keys)).toBe(true);
      expect(typeof keys[0]).toBe('string');
    });
  });

  describe('Cache Invalidation Pattern', () => {
    it('should support hierarchical invalidation', () => {
      // Invalidating 'users' should match all user queries
      const allUsersKey = userKeys.all();
      const userListKey = userKeys.lists();
      const userDetailKey = userKeys.detail('123');
      
      // All these keys should start with the base 'users' key
      expect(userListKey[0]).toBe(allUsersKey[0]);
      expect(userDetailKey[0]).toBe(allUsersKey[0]);
    });

    it('should differentiate between different entity types', () => {
      expect(userKeys.all()[0]).not.toBe(locationKeys.all()[0]);
      expect(jobKeys.all()[0]).not.toBe(fileKeys.all()[0]);
    });
  });
});