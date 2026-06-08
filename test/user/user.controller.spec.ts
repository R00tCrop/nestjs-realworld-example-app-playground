import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    generateJWT: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
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

  describe('findMe', () => {
    it('should return current user', async () => {
      const mockResult = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Test bio',
          image: 'test.jpg',
          token: 'jwt-token',
        },
      };
      mockUserService.findByEmail.mockResolvedValue(mockResult);

      const result = await controller.findMe('test@example.com');

      expect(result).toEqual(mockResult);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'test@example.com',
        bio: 'Updated bio',
        image: 'image.jpg',
      };
      const mockResult = {
        id: 1,
        username: 'updateduser',
        email: 'test@example.com',
      };
      mockUserService.update.mockResolvedValue(mockResult);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(mockResult);
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const mockResult = {
        user: {
          id: 1,
          username: 'newuser',
          email: 'new@example.com',
          bio: '',
          image: '',
          token: 'jwt-token',
        },
      };
      mockUserService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockResult);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const mockResult = { affected: 1, raw: {} };
      mockUserService.delete.mockResolvedValue(mockResult);

      const result = await controller.delete({ slug: 'test@example.com' });

      expect(result).toEqual(mockResult);
      expect(mockUserService.delete).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
        image: 'test.jpg',
      };
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.generateJWT.mockReturnValue('jwt-token');

      const result = await controller.login(loginUserDto);

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.token).toBe('jwt-token');
      expect(mockUserService.findOne).toHaveBeenCalledWith(loginUserDto);
      expect(mockUserService.generateJWT).toHaveBeenCalledWith(mockUser);
    });

    it('should throw exception if user not found', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      mockUserService.findOne.mockResolvedValue(null);

      await expect(controller.login(loginUserDto)).rejects.toThrow(HttpException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(loginUserDto);
    });
  });
});
