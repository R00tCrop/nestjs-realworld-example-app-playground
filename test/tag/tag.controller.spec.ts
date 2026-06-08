import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from '../../src/tag/tag.controller';
import { TagService } from '../../src/tag/tag.service';
import { TagEntity } from '../../src/tag/tag.entity';

describe('TagController', () => {
  let controller: TagController;
  let service: TagService;

  const mockTagService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
    }).compile();

    controller = module.get<TagController>(TagController);
    service = module.get<TagService>(TagService);
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
    it('should return all tags', async () => {
      const mockTags = [
        { id: 1, tag: 'javascript' },
        { id: 2, tag: 'nestjs' },
      ] as TagEntity[];
      mockTagService.findAll.mockResolvedValue(mockTags);

      const result = await controller.findAll();

      expect(result).toEqual(mockTags);
      expect(mockTagService.findAll).toHaveBeenCalled();
    });

    it('should return empty array if no tags exist', async () => {
      mockTagService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockTagService.findAll).toHaveBeenCalled();
    });
  });
});
