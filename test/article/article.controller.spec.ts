import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from '../../src/article/article.controller';
import { ArticleService } from '../../src/article/article.service';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  const mockArticleService = {
    findAll: jest.fn(),
    findFeed: jest.fn(),
    findOne: jest.fn(),
    findComments: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
    favorite: jest.fn(),
    unFavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
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

  describe('findAll', () => {
    it('should return all articles', async () => {
      const mockResult = {
        articles: [{ id: 1, title: 'Test Article' }],
        articlesCount: 1,
      };
      mockArticleService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResult);
      expect(mockArticleService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getFeed', () => {
    it('should return article feed for user', async () => {
      const mockResult = {
        articles: [{ id: 1, title: 'Test Article' }],
        articlesCount: 1,
      };
      mockArticleService.findFeed.mockResolvedValue(mockResult);

      const result = await controller.getFeed(1, {});

      expect(result).toEqual(mockResult);
      expect(mockArticleService.findFeed).toHaveBeenCalledWith(1, {});
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      const mockResult = {
        article: { id: 1, title: 'Test Article', slug: 'test-article' },
      };
      mockArticleService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne('test-article');

      expect(result).toEqual(mockResult);
      expect(mockArticleService.findOne).toHaveBeenCalledWith({ slug: 'test-article' });
    });
  });

  describe('findComments', () => {
    it('should return comments for an article', async () => {
      const mockResult = {
        comments: [{ id: 1, body: 'Test comment' }],
      };
      mockArticleService.findComments.mockResolvedValue(mockResult);

      const result = await controller.findComments('test-article');

      expect(result).toEqual(mockResult);
      expect(mockArticleService.findComments).toHaveBeenCalledWith('test-article');
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
      const mockResult = { id: 1, ...articleData };
      mockArticleService.create.mockResolvedValue(mockResult);

      const result = await controller.create(1, articleData);

      expect(result).toEqual(mockResult);
      expect(mockArticleService.create).toHaveBeenCalledWith(1, articleData);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const articleData = {
        title: 'Updated Article',
        description: 'Updated description',
        body: 'Updated body',
        tagList: ['test'],
      };
      const mockResult = {
        article: { id: 1, slug: 'test-article', ...articleData },
      };
      mockArticleService.update.mockResolvedValue(mockResult);

      const result = await controller.update({ slug: 'test-article' }, articleData);

      expect(result).toEqual(mockResult);
      expect(mockArticleService.update).toHaveBeenCalledWith('test-article', articleData);
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const mockResult = { affected: 1, raw: {} };
      mockArticleService.delete.mockResolvedValue(mockResult);

      const result = await controller.delete({ slug: 'test-article' });

      expect(result).toEqual(mockResult);
      expect(mockArticleService.delete).toHaveBeenCalledWith('test-article');
    });
  });

  describe('createComment', () => {
    it('should create a comment on an article', async () => {
      const commentData = { body: 'Test comment' };
      const mockResult = {
        article: { id: 1, title: 'Test Article', comments: [commentData] },
      };
      mockArticleService.addComment.mockResolvedValue(mockResult);

      const result = await controller.createComment('test-article', commentData);

      expect(result).toEqual(mockResult);
      expect(mockArticleService.addComment).toHaveBeenCalledWith('test-article', commentData);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment from an article', async () => {
      const mockResult = {
        article: { id: 1, title: 'Test Article', comments: [] },
      };
      mockArticleService.deleteComment.mockResolvedValue(mockResult);

      const result = await controller.deleteComment({ slug: 'test-article', id: '1' });

      expect(result).toEqual(mockResult);
      expect(mockArticleService.deleteComment).toHaveBeenCalledWith('test-article', '1');
    });
  });

  describe('favorite', () => {
    it('should favorite an article', async () => {
      const mockResult = {
        article: { id: 1, title: 'Test Article', favoriteCount: 1 },
      };
      mockArticleService.favorite.mockResolvedValue(mockResult);

      const result = await controller.favorite(1, 'test-article');

      expect(result).toEqual(mockResult);
      expect(mockArticleService.favorite).toHaveBeenCalledWith(1, 'test-article');
    });
  });

  describe('unFavorite', () => {
    it('should unfavorite an article', async () => {
      const mockResult = {
        article: { id: 1, title: 'Test Article', favoriteCount: 0 },
      };
      mockArticleService.unFavorite.mockResolvedValue(mockResult);

      const result = await controller.unFavorite(1, 'test-article');

      expect(result).toEqual(mockResult);
      expect(mockArticleService.unFavorite).toHaveBeenCalledWith(1, 'test-article');
    });
  });
});
