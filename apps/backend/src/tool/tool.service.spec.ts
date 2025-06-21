import { Test, TestingModule } from '@nestjs/testing';
import { ToolService } from './tool.service';
import {
  TOOL_REPOSITORY,
  IToolRepository,
} from './repositories/tool.repository.interface';
import { CreateToolDto } from '@shared/dto/tool/create-tool.dto';
import { UpdateToolDto } from '@shared/dto/tool/update-tool.dto';
import { EToolName, EStatusTool } from '@shared/enums/tool.enum';

describe('ToolService', () => {
  let service: ToolService;

  // Mock do repositório
  const mockToolRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByStatus: jest.fn(),
    findByToolName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolService,
        {
          provide: TOOL_REPOSITORY,
          useValue: mockToolRepository,
        },
      ],
    }).compile();

    service = module.get<ToolService>(ToolService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //Teste para o create
  describe('create', () => {
    it('deve criar uma ferramenta', async () => {
      const dto: CreateToolDto = {
        toolName: EToolName.ENXADA,
        status: EStatusTool.REQUESTED,
      };

      const expectedResult = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockToolRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);

      expect(result).toEqual(expectedResult);
      expect(mockToolRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  //Teste para o FindOne
  describe('findOne', () => {
    it('deve retornar uma ferramenta existente pelo ID', async () => {
      const id = '123';
      const mockTool = {
        id,
        toolName: EToolName.ENXADA,
        status: EStatusTool.REQUESTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockToolRepository.findOne.mockResolvedValue(mockTool);

      const result = await service.findOne(id);

      expect(result).toEqual(mockTool);
      expect(mockToolRepository.findOne).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException se a ferramenta não for encontrada', async () => {
      const id = 'nao-existe';
      mockToolRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrowError(
        `Ferramenta com o código ${id} não encontrada`
      );

      expect(mockToolRepository.findOne).toHaveBeenCalledWith(id);
    });
  });

  //Teste para o findAll
  describe('findAll', () => {
    it('deve retornar uma lista de ferramentas', async () => {
      const mockTools = [
        {
          id: '1',
          toolName: EToolName.ENXADA,
          status: EStatusTool.LENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          toolName: EToolName.PA,
          status: EStatusTool.REQUESTED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockToolRepository.findAll.mockResolvedValue(mockTools);

      const result = await service.findAll();

      expect(result).toEqual(mockTools);
      expect(mockToolRepository.findAll).toHaveBeenCalled();
    });
  });

  //Teste para o update
  describe('update', () => {
    it('deve atualizar uma ferramenta existente', async () => {
      const id = '1';
      const updateDto: UpdateToolDto = {
        status: EStatusTool.RETURNED,
      };

      const updatedTool = {
        id,
        toolName: EToolName.ENXADA,
        status: EStatusTool.RETURNED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockToolRepository.update.mockResolvedValue(updatedTool);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(updatedTool);
      expect(mockToolRepository.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('deve lançar NotFoundException se a ferramenta não for encontrada', async () => {
      const id = '999';
      const updateDto: UpdateToolDto = {
        status: EStatusTool.LENDING,
      };

      mockToolRepository.update.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrowError(
        `Ferramenta com código ${id} não encontrada`
      );

      expect(mockToolRepository.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  //Teste para o delete
  describe('delete', () => {
    it('deve deletar uma ferramenta existente', async () => {
      const id = '1';
      const mockTool = {
        id,
        toolName: EToolName.PA,
        status: EStatusTool.LENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockToolRepository.findOne.mockResolvedValue(mockTool);
      mockToolRepository.delete.mockResolvedValue(undefined); // delete retorna void

      await expect(service.delete(id)).resolves.toBeUndefined();

      expect(mockToolRepository.findOne).toHaveBeenCalledWith(id);
      expect(mockToolRepository.delete).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException se a ferramenta não existir', async () => {
      const id = '999';
      mockToolRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrowError(
        `Ferramenta com o código ${id} não encontrada`
      );

      expect(mockToolRepository.findOne).toHaveBeenCalledWith(id);
      expect(mockToolRepository.delete).not.toHaveBeenCalled();
    });
  });

  //Teste para o findByStatus
  describe('findByStatus', () => {
    it('deve retornar ferramentas com o status informado', async () => {
      const status = EStatusTool.REQUESTED;

      const mockTools = [
        {
          id: '1',
          toolName: EToolName.PA,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          toolName: EToolName.TRATOR,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockToolRepository.findByStatus.mockResolvedValue(mockTools);

      const result = await service.findByStatus(status);

      expect(result).toEqual(mockTools);
      expect(mockToolRepository.findByStatus).toHaveBeenCalledWith(status);
    });
  });

  //Teste para o findByToolName
  describe('findByToolName', () => {
    it('deve retornar ferramentas com o nome informado', async () => {
      const toolName = EToolName.TRATOR;

      const mockTools = [
        {
          id: '1',
          toolName,
          status: EStatusTool.REQUESTED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          toolName,
          status: EStatusTool.RETURNED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockToolRepository.findByToolName.mockResolvedValue(mockTools);

      const result = await service.findByToolName(toolName);

      expect(result).toEqual(mockTools);
      expect(mockToolRepository.findByToolName).toHaveBeenCalledWith(toolName);
    });
  });
});
