import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { UserService } from '../../src/user/user.service';
import { UserEntity } from '../../src/user/user.entity';
import * as argon2 from 'argon2';

jest.mock('argon2');
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getRepository: jest.fn(),
  };
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
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
    it('should return a user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.findOne({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne({ email: 'test@example.com', password: 'password' });

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.findOne({ email: 'test@example.com', password: 'wrongpassword' });

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const savedUser = {
        id: 1,
        ...createUserDto,
        articles: [],
      } as UserEntity;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      (getRepository as jest.Mock).mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      });

      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('token');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw exception if username or email already exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
      } as UserEntity;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingUser),
      };

      (getRepository as jest.Mock).mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        favorites: [],
      } as UserEntity;
      const updateDto = { username: 'updateduser' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(result.username).toBe('updateduser');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockUserRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.delete('test@example.com');

      expect(result).toEqual(deleteResult);
      expect(mockUserRepository.delete).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('token');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw exception if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('token');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('generateJWT', () => {
    it('should generate a JWT token', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      const token = service.generateJWT(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});
