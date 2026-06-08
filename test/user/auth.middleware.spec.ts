import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthMiddleware } from '../../src/user/auth.middleware';
import { UserService } from '../../src/user/user.service';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let userService: UserService;

  const mockUserService = {
    findById: jest.fn(),
  };

  const mockRequest: any = {
    headers: {},
    user: null,
  };

  const mockResponse: any = {};

  const mockNext = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRequest.headers = {};
    mockRequest.user = null;
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('use', () => {
    it('should authenticate user with valid token', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = { id: 1, username: 'testuser', email: 'test@example.com' };
      const mockUser = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      mockRequest.headers.authorization = `Bearer ${token}`;
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockRequest.user).toEqual(mockUser.user);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw exception if no authorization header', async () => {
      mockRequest.headers.authorization = undefined;

      await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrow(
        HttpException,
      );
      await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrow(
        'Not authorized.',
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw exception if authorization header has no token', async () => {
      mockRequest.headers.authorization = 'Bearer ';

      await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrow(
        HttpException,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw exception if user not found', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = { id: 999, username: 'nonexistent', email: 'none@example.com' };

      mockRequest.headers.authorization = `Bearer ${token}`;
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(null);

      await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrow(
        HttpException,
      );
      await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrow(
        'User not found.',
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw exception if token is invalid', async () => {
      const token = 'invalid-jwt-token';

      mockRequest.headers.authorization = `Bearer ${token}`;
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrow();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
