import { Test, TestingModule } from '@nestjs/testing';
import { ConversionRepository } from '../conversion.repository';
import { ConversionService } from '../conversion.service';
import { CoinRepository } from '../../coin/coin.repository';
import { getModelToken } from '@nestjs/mongoose';
import { ConversionController } from '../conversion.controller';
import { NotFoundException } from '@nestjs/common';

describe('ConversionController', () => {
  let coinRepository: CoinRepository;
  let conversionController: ConversionController;
  let conversionRepository: ConversionRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoinRepository,
        ConversionRepository,
        {
          provide: getModelToken('Coin'),
          useValue: {},
        },
        {
          provide: getModelToken('Conversion'),
          useValue: {},
        },
        ConversionService,
      ],
      controllers: [ConversionController],
    }).compile();

    conversionController = app.get(ConversionController);
    conversionRepository = app.get(ConversionRepository);
    coinRepository = app.get(CoinRepository);
  });

  describe('load data for conversions', () => {
    it('shuld create a new conversion', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue({
        code: 'TTT',
        symbol: 'T',
        name: 'teste',
      });

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        to: 'teste',
        from: 'teste1',
        conversion: 12,
      });

      await expect(
        conversionController.loadConversion({
          from: 'teste1',
          to: 'teste',
          conversion: 12,
        }),
      ).resolves.toEqual({
        success: true,
      });
    });

    it('should return an error because coin not found', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        to: 'teste',
        from: 'teste1',
        conversion: 12,
      });

      const error = new NotFoundException({
        message: 'from coin not found',
      });

      await expect(
        conversionController.loadConversion({
          from: 'teste1',
          to: 'teste',
          conversion: 12,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('conversion', () => {
    it('should convert found with depth 0', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue({
        code: 'TTT',
        symbol: 'T',
        name: 'teste',
      });

      jest
        .spyOn(conversionRepository, 'findExactConversion')
        .mockResolvedValue({
          from: 'TTT',
          to: 'TT1',
          conversion: 10,
        });

      await expect(
        conversionController.convert({
          from: 'teste1',
          to: 'teste',
          value: 10,
        }),
      ).resolves.toEqual({
        from: 'teste1',
        to: 'teste',
        value: 10,
        conversion: 100,
      });
    });

    it('should convert with depth > 0 creating a graph', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue({
        code: 'TTT',
        symbol: 'T',
        name: 'teste',
      });

      jest
        .spyOn(conversionRepository, 'findExactConversion')
        .mockResolvedValue(null);

      jest.spyOn(conversionRepository, 'findAll').mockResolvedValue([
        {
          to: 'TTT',
          from: 'TT1',
          conversion: 10,
        },
        {
          to: 'TT2',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        to: 'teste',
        from: 'teste1',
        conversion: 12,
      });

      await expect(
        conversionController.convert({
          from: 'TT1',
          to: 'TT2',
          value: 10,
        }),
      ).resolves.toEqual({
        from: 'TT1',
        to: 'TT2',
        value: 10,
        conversion: 1000,
      });
    });

    it('should return an error because not found coins', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      jest
        .spyOn(conversionRepository, 'findExactConversion')
        .mockResolvedValue(null);

      jest.spyOn(conversionRepository, 'findAll').mockResolvedValue([
        {
          to: 'TTT',
          from: 'TT1',
          conversion: 10,
        },
        {
          to: 'TT2',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        to: 'teste',
        from: 'teste1',
        conversion: 12,
      });

      const error = new NotFoundException({
        message: 'from coin not found',
      });

      await expect(
        conversionController.convert({
          from: 'TT1',
          to: 'TT2',
          value: 10,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('convert to all coins', () => {
    it('should convert to all coins without deep graph search', async () => {
      jest.spyOn(coinRepository, 'findAll').mockResolvedValue([
        {
          code: 'TTT',
          symbol: 'T',
          name: 'teste',
        },
        {
          code: 'TT1',
          symbol: 'T1',
          name: 'teste 1',
        },
        {
          code: 'TT2',
          symbol: 'T2',
          name: 'teste 2',
        },
      ]);

      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue({
        code: 'TTT',
        symbol: 'T',
        name: 'teste',
      });

      jest.spyOn(conversionRepository, 'findAllByFrom').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
        {
          to: 'TT2',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      await expect(
        conversionController.convertAll({
          from: 'TTT',
          value: 10,
        }),
      ).resolves.toEqual({
        conversions: [
          {
            to: 'TT1',
            from: 'TTT',
            value: 10,
            conversion: 100,
          },
          {
            to: 'TT2',
            from: 'TTT',
            value: 10,
            conversion: 100,
          },
        ],
      });
    });

    it('it should convert with deep graph search', async () => {
      jest.spyOn(coinRepository, 'findAll').mockResolvedValue([
        {
          code: 'TTT',
          symbol: 'T',
          name: 'teste',
        },
        {
          code: 'TT1',
          symbol: 'T1',
          name: 'teste 1',
        },
        {
          code: 'TT2',
          symbol: 'T2',
          name: 'teste 2',
        },
      ]);

      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue({
        code: 'TTT',
        symbol: 'T',
        name: 'teste',
      });

      jest.spyOn(conversionRepository, 'findAllByFrom').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'findAll').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
        {
          to: 'TT2',
          from: 'TT1',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        from: 'TTT',
        to: 'TT1',
        conversion: 10,
      });

      await expect(
        conversionController.convertAll({
          from: 'TTT',
          value: 10,
        }),
      ).resolves.toEqual({
        conversions: [
          {
            to: 'TT1',
            from: 'TTT',
            value: 10,
            conversion: 100,
          },
          {
            to: 'TT2',
            from: 'TTT',
            value: 10,
            conversion: 1000,
          },
        ],
      });
    });

    it('should convert but have not enough data to convert', async () => {
      jest.spyOn(coinRepository, 'findAll').mockResolvedValue([
        {
          code: 'TTT',
          symbol: 'T',
          name: 'teste',
        },
        {
          code: 'TT1',
          symbol: 'T1',
          name: 'teste 1',
        },
        {
          code: 'TT2',
          symbol: 'T2',
          name: 'teste 2',
        },
      ]);

      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue({
        code: 'TTT',
        symbol: 'T',
        name: 'teste',
      });

      jest.spyOn(conversionRepository, 'findAllByFrom').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'findAll').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        from: 'TTT',
        to: 'TT1',
        conversion: 10,
      });

      await expect(
        conversionController.convertAll({
          from: 'TTT',
          value: 10,
        }),
      ).resolves.toEqual({
        conversions: [
          {
            to: 'TT1',
            from: 'TTT',
            value: 10,
            conversion: 100,
          },
          {
            to: 'TT2',
            from: 'TTT',
            value: 10,
            conversion: 'not enough data to convert',
          },
        ],
      });
    });

    it('should not convert because from not valid', async () => {
      jest.spyOn(coinRepository, 'findAll').mockResolvedValue([
        {
          code: 'TTT',
          symbol: 'T',
          name: 'teste',
        },
        {
          code: 'TT1',
          symbol: 'T1',
          name: 'teste 1',
        },
        {
          code: 'TT2',
          symbol: 'T2',
          name: 'teste 2',
        },
      ]);

      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      jest.spyOn(conversionRepository, 'findAllByFrom').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'findAll').mockResolvedValue([
        {
          to: 'TT1',
          from: 'TTT',
          conversion: 10,
        },
      ]);

      jest.spyOn(conversionRepository, 'upsertConversion').mockResolvedValue({
        from: 'TTT',
        to: 'TT1',
        conversion: 10,
      });

      const error = new NotFoundException({
        message: 'from coin not found',
      });

      await expect(
        conversionController.convertAll({
          from: 'TTT',
          value: 10,
        }),
      ).rejects.toThrow(error);
    });
  });
});
