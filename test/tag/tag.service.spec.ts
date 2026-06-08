import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagService } from '../../src/tag/tag.service';
import { TagEntity } from '../../src/tag/tag.entity';

describe('TagService', () => {
  let service: TagService;
  let tagRepository: Repository<TagEntity>;

  const mockTagRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(TagEntity),
          useValue: mockTagRepository,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    tagRepository = module.get<Repository<TagEntity>>(getRepositoryToken(TagEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('tagRepository should be defined', () => {
    expect(tagRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const mockTags = [
        { id: 1, tag: 'javascript' },
        { id: 2, tag: 'nestjs' },
      ] as TagEntity[];
      mockTagRepository.find.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(result).toEqual(mockTags);
      expect(mockTagRepository.find).toHaveBeenCalled();
    });

    it('should return empty array if no tags exist', async () => {
      mockTagRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockTagRepository.find).toHaveBeenCalled();
    });
  });
});
