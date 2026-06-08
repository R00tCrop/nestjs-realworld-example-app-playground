import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from '../../src/article/article.service';
import { ArticleEntity } from '../../src/article/article.entity';
import { Comment } from '../../src/article/comment.entity';
import { UserEntity } from '../../src/user/user.entity';
import { FollowsEntity } from '../../src/profile/follows.entity';

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: Repository<ArticleEntity>;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<UserEntity>;
  let followsRepository: Repository<FollowsEntity>;

  const mockArticleRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockCommentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockFollowsRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: mockArticleRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
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

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<Repository<ArticleEntity>>(getRepositoryToken(ArticleEntity));
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    followsRepository = module.get<Repository<FollowsEntity>>(getRepositoryToken(FollowsEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('articleRepository should be defined', () => {
    expect(articleRepository).toBeDefined();
  });

  it('commentRepository should be defined', () => {
    expect(commentRepository).toBeDefined();
  });

  it('userRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('followsRepository should be defined', () => {
    expect(followsRepository).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      const mockArticle = { id: 1, title: 'Test Article' } as ArticleEntity;
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      const result = await service.findOne({ id: 1 });

      expect(result).toEqual({ article: mockArticle });
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('addComment', () => {
    it('should add a comment to an article', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        comments: [],
      } as ArticleEntity;
      const mockComment = { id: 1, body: 'Test comment' } as Comment;
      const commentData = { body: 'Test comment' };

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockCommentRepository.save.mockResolvedValue(mockComment);
      mockArticleRepository.save.mockResolvedValue({ ...mockArticle, comments: [mockComment] });

      const result = await service.addComment('test-slug', commentData);

      expect(result).toHaveProperty('article');
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ slug: 'test-slug' });
      expect(mockCommentRepository.save).toHaveBeenCalled();
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment from an article', async () => {
      const mockComment = { id: 1, body: 'Test comment' } as Comment;
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        comments: [mockComment],
      } as ArticleEntity;

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.delete.mockResolvedValue({ affected: 1 });
      mockArticleRepository.save.mockResolvedValue({ ...mockArticle, comments: [] });

      const result = await service.deleteComment('test-slug', '1');

      expect(result).toHaveProperty('article');
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ slug: 'test-slug' });
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('favorite', () => {
    it('should favorite an article', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        favoriteCount: 0,
      } as ArticleEntity;
      const mockUser = {
        id: 1,
        favorites: [],
      } as UserEntity;

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockArticleRepository.save.mockResolvedValue({ ...mockArticle, favoriteCount: 1 });

      const result = await service.favorite(1, 'test-slug');

      expect(result).toHaveProperty('article');
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ slug: 'test-slug' });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('unFavorite', () => {
    it('should unfavorite an article', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        favoriteCount: 1,
      } as ArticleEntity;
      const mockUser = {
        id: 1,
        favorites: [mockArticle],
      } as UserEntity;

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockArticleRepository.save.mockResolvedValue({ ...mockArticle, favoriteCount: 0 });

      const result = await service.unFavorite(1, 'test-slug');

      expect(result).toHaveProperty('article');
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ slug: 'test-slug' });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findComments', () => {
    it('should return comments for an article', async () => {
      const mockComments = [{ id: 1, body: 'Test comment' }] as Comment[];
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        comments: mockComments,
      } as ArticleEntity;

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      const result = await service.findComments('test-slug');

      expect(result).toEqual({ comments: mockComments });
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ slug: 'test-slug' });
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const articleData = {
        title: 'Test Article',
        description: 'Test description',
        body: 'Test body',
        tagList: ['test'],
      };
      const mockArticle = {
        id: 1,
        ...articleData,
        slug: 'test-article',
        comments: [],
      } as ArticleEntity;
      const mockUser = {
        id: 1,
        articles: [],
      } as UserEntity;

      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(1, articleData);

      expect(result).toBeDefined();
      expect(mockArticleRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
      } as ArticleEntity;
      const updateData = { title: 'Updated Article' };

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue({ ...mockArticle, ...updateData });

      const result = await service.update('test-article', updateData);

      expect(result).toHaveProperty('article');
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ slug: 'test-article' });
      expect(mockArticleRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockArticleRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.delete('test-slug');

      expect(result).toEqual(deleteResult);
      expect(mockArticleRepository.delete).toHaveBeenCalledWith({ slug: 'test-slug' });
    });
  });

  describe('slugify', () => {
    it('should generate a slug from a title', () => {
      const title = 'Test Article Title';
      const result = service.slugify(title);

      expect(result).toMatch(/^test-article-title-[a-z0-9]+$/);
    });
  });
});
