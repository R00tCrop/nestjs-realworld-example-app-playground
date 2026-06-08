import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '../../src/profile/profile.controller';
import { ProfileService } from '../../src/profile/profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfileService = {
    findProfile: jest.fn(),
    follow: jest.fn(),
    unFollow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return a user profile', async () => {
      const mockResult = {
        profile: {
          username: 'testuser',
          bio: 'Test bio',
          image: 'test.jpg',
          following: false,
        },
      };
      mockProfileService.findProfile.mockResolvedValue(mockResult);

      const result = await controller.getProfile(1, 'testuser');

      expect(result).toEqual(mockResult);
      expect(mockProfileService.findProfile).toHaveBeenCalledWith(1, 'testuser');
    });
  });

  describe('follow', () => {
    it('should follow a user', async () => {
      const mockResult = {
        profile: {
          username: 'testuser',
          bio: 'Test bio',
          image: 'test.jpg',
          following: true,
        },
      };
      mockProfileService.follow.mockResolvedValue(mockResult);

      const result = await controller.follow('follower@example.com', 'testuser');

      expect(result).toEqual(mockResult);
      expect(mockProfileService.follow).toHaveBeenCalledWith('follower@example.com', 'testuser');
    });
  });

  describe('unFollow', () => {
    it('should unfollow a user', async () => {
      const mockResult = {
        profile: {
          username: 'testuser',
          bio: 'Test bio',
          image: 'test.jpg',
          following: false,
        },
      };
      mockProfileService.unFollow.mockResolvedValue(mockResult);

      const result = await controller.unFollow(1, 'testuser');

      expect(result).toEqual(mockResult);
      expect(mockProfileService.unFollow).toHaveBeenCalledWith(1, 'testuser');
    });
  });
});
