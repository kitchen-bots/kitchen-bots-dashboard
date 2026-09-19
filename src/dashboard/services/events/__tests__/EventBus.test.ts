import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '../EventBus';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all listeners between tests by creating a new instance internally or using a private method if exposed.
    // Since it's a singleton, we need to access private listeners for testing or ensure tests clean up.
    // We can cast to any to clear listeners map.
    (eventBus as any).listeners.clear();
  });

  it('should subscribe and receive published events', () => {
    const callback = vi.fn();
    eventBus.subscribe('ThemeChanged', callback);
    
    const payload = { theme: 'dark' as const };
    eventBus.publish('ThemeChanged', payload);
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should unsubscribe and stop receiving events', () => {
    const callback = vi.fn();
    const unsubscribe = eventBus.subscribe('SidebarCollapsed', callback);
    
    unsubscribe(); // Unsubscribe via returned function
    
    eventBus.publish('SidebarCollapsed', { isCollapsed: true });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should support manual unsubscribe', () => {
    const callback = vi.fn();
    eventBus.subscribe('SidebarCollapsed', callback);
    eventBus.unsubscribe('SidebarCollapsed', callback); // Unsubscribe explicitly
    
    eventBus.publish('SidebarCollapsed', { isCollapsed: true });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should support once method', () => {
    const callback = vi.fn();
    eventBus.once('UserLoggedIn', callback);
    
    const payload = { userId: '1', role: 'admin' };
    
    eventBus.publish('UserLoggedIn', payload);
    eventBus.publish('UserLoggedIn', payload); // Should not trigger callback again
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should not throw if publishing to an event with no subscribers', () => {
    expect(() => {
      eventBus.publish('SessionExpired', undefined as void);
    }).not.toThrow();
  });
});
