import { 
  getUserById,
  updateUserProfile,
  getUserSubscription,
  getUserUsageStats
} from '@/lib/db/users';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Users Database Functions', () => {
  let mockSupabase: any;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    mockSingle = jest.fn();
    mockEq = jest.fn();
    mockSelect = jest.fn();
    mockUpdate = jest.fn();
    mockFrom = jest.fn();

    // Setup chain returns
    mockEq.mockReturnThis();
    mockSelect.mockReturnThis();
    mockUpdate.mockReturnThis();
    
    const chainableMethods = {
      select: mockSelect,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
    };
    
    Object.values(chainableMethods).forEach(method => {
      method.mockReturnValue(chainableMethods);
    });

    mockFrom.mockReturnValue(chainableMethods);

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01',
      };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const result = await getUserById('user123');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockEq).toHaveBeenCalledWith('id', 'user123');
      expect(result).toEqual(mockUser);
    });

    it('should return null on error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        username: 'newusername',
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      const updatedUser = {
        id: 'user123',
        ...updates,
      };

      mockSingle.mockResolvedValue({ data: updatedUser, error: null });

      const result = await updateUserProfile('user123', updates);

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'user123');
      expect(result).toEqual(updatedUser);
    });

    it('should handle update errors', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Update failed' } });

      const result = await updateUserProfile('user123', { username: 'new' });

      expect(result).toBeNull();
    });
  });

  describe('getUserSubscription', () => {
    it('should fetch user subscription', async () => {
      const mockSubscription = {
        id: 'sub123',
        user_id: 'user123',
        plan_id: 'pro',
        status: 'active',
        current_period_end: '2024-12-31',
      };

      mockSingle.mockResolvedValue({ data: mockSubscription, error: null });

      const result = await getUserSubscription('user123');

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(result).toEqual(mockSubscription);
    });

    it('should return null if no subscription exists', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null });

      const result = await getUserSubscription('user123');

      expect(result).toBeNull();
    });
  });

  describe('getUserUsageStats', () => {
    it('should calculate usage statistics', async () => {
      const mockUsageRecords = [
        { tokens_used: 100, created_at: '2024-01-01' },
        { tokens_used: 200, created_at: '2024-01-02' },
        { tokens_used: 300, created_at: '2024-01-03' },
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({ 
              data: mockUsageRecords, 
              error: null 
            })
          })
        })
      });

      const result = await getUserUsageStats('user123');

      expect(mockFrom).toHaveBeenCalledWith('usage_records');
      expect(result).toEqual({
        totalTokensUsed: 600,
        recordCount: 3,
        dailyAverage: 200,
      });
    });

    it('should handle empty usage records', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          })
        })
      });

      const result = await getUserUsageStats('user123');

      expect(result).toEqual({
        totalTokensUsed: 0,
        recordCount: 0,
        dailyAverage: 0,
      });
    });
  });
});