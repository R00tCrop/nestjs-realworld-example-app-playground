import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProfileService } from '../../src/profile/profile.service';
import { UserEntity } from '../../src/user/user.entity';
import { FollowsEntity } from '../../src/profile/follows.entity';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: Repository<UserEntity>;
  let followsRepository: Repository<FollowsEntity>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockFollowsRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(FollowsEntity),
          useValue: mockFollowsRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    followsRepository = module.get<Repository<FollowsEntity>>(getRepositoryToken(FollowsEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('userRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('followsRepository should be defined', () => {
    expect(followsRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ] as UserEntity[];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user profile without password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com',
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne({ username: 'testuser' });

      expect(result.profile).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });

  describe('findProfile', () => {
    it('should return a profile with following status', async () => {
      const mockUser = {
        id: 2,
        username: 'followinguser',
        bio: 'Test bio',
        image: 'test.jpg',
      } as UserEntity;
      const mockFollows = {
        followerId: 1,
        followingId: 2,
      } as FollowsEntity;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFollowsRepository.findOne.mockResolvedValue(mockFollows);

      const result = await service.findProfile(1, 'followinguser');

      expect(result.profile).toBeDefined();
      expect(result.profile.username).toBe('followinguser');
      expect(result.profile.following).toBe(true);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: 'followinguser' });
    });

    it('should return undefined if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findProfile(1, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('follow', () => {
    it('should follow a user', async () => {
      const mockFollowingUser = {
        id: 2,
        username: 'followinguser',
        email: 'following@example.com',
        bio: 'Test bio',
        image: 'test.jpg',
      } as UserEntity;
      const mockFollowerUser = {
        id: 1,
        username: 'followeruser',
        email: 'follower@example.com',
      } as UserEntity;

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockFollowingUser)
        .mockResolvedValueOnce(mockFollowerUser);
      mockFollowsRepository.findOne.mockResolvedValue(null);
      mockFollowsRepository.save.mockResolvedValue({} as FollowsEntity);

      const result = await service.follow('follower@example.com', 'followinguser');

      expect(result.profile).toBeDefined();
      expect(result.profile.following).toBe(true);
      expect(mockFollowsRepository.save).toHaveBeenCalled();
    });

    it('should throw exception if follower email and username not provided', async () => {
      await expect(service.follow('', '')).rejects.toThrow(HttpException);
      await expect(service.follow('', '')).rejects.toThrow('Follower email and username not provided.');
    });

    it('should throw exception if trying to follow self', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      } as UserEntity;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.follow('test@example.com', 'testuser')).rejects.toThrow(HttpException);
    });
  });

  describe('unFollow', () => {
    it('should unfollow a user', async () => {
      const mockFollowingUser = {
        id: 2,
        username: 'followinguser',
        bio: 'Test bio',
        image: 'test.jpg',
      } as UserEntity;

      mockUserRepository.findOne.mockResolvedValue(mockFollowingUser);
      mockFollowsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.unFollow(1, 'followinguser');

      expect(result.profile).toBeDefined();
      expect(result.profile.following).toBe(false);
      expect(mockFollowsRepository.delete).toHaveBeenCalledWith({
        followerId: 1,
        followingId: 2,
      });
    });

    it('should throw exception if followerId and username not provided', async () => {
      await expect(service.unFollow(null, '')).rejects.toThrow(HttpException);
      await expect(service.unFollow(null, '')).rejects.toThrow('FollowerId and username not provided.');
    });

    it('should throw exception if trying to unfollow self', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
      } as UserEntity;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.unFollow(1, 'testuser')).rejects.toThrow(HttpException);
    });
  });
});
