import { Test, TestingModule } from '@nestjs/testing';
import { CoinRepository } from '../coin.repository';
import { CoinController } from '../coin.controller';
import { Coin } from '../coin.entity';
import { CoinService } from '../coin.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

const getAllCoins: Coin[] = [
  {
    symbol: 't',
    code: 'TTT',
    name: 'teste',
  },
  {
    symbol: 't1',
    code: 'TT1',
    name: 'teste',
  },
];

const getCoinByCode: Coin = {
  symbol: 't',
  code: 'TTT',
  name: 'teste',
};

const createdCoin: Coin = {
  symbol: 't',
  code: 'TTT',
  name: 'teste',
};

describe('coin controller', () => {
  let coinRepository: CoinRepository;
  let coinController: CoinController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoinRepository,
        CoinService,
        {
          provide: getModelToken('Coin'),
          useValue: {},
        },
      ],
      controllers: [CoinController],
    }).compile();

    coinController = app.get(CoinController);
    coinRepository = app.get(CoinRepository);
  });

  describe('Get all Coins', () => {
    it('Should return all Coins', async () => {
      jest.spyOn(coinRepository, 'findAll').mockResolvedValue(getAllCoins);

      await expect(coinController.getAll()).resolves.toEqual(getAllCoins);
    });

    it('should return [] because not found any', async () => {
      jest.spyOn(coinRepository, 'findAll').mockResolvedValue([]);

      await expect(coinController.getAll()).resolves.toEqual([]);
    });
  });

  describe('get by code', () => {
    it('should return one because found', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(getCoinByCode);

      await expect(coinController.getByCode('ttt')).resolves.toEqual(
        getCoinByCode,
      );
    });

    it('should return error because not found', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      const error = new NotFoundException({
        message: 'Coins not found',
      });

      await expect(coinController.getByCode('ttt')).rejects.toThrow(error);
    });
  });

  describe('create new coin', () => {
    it('should create', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      jest.spyOn(coinRepository, 'create').mockResolvedValue(createdCoin);

      await expect(
        coinController.createCoin({
          code: 'ttt',
          name: 'teste',
          symbol: 'T',
        }),
      ).resolves.toEqual(createdCoin);
    });

    it('should return an error because found previous coin', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(getCoinByCode);

      jest.spyOn(coinRepository, 'create').mockResolvedValue(createdCoin);

      const error = new ConflictException({
        message: 'Coin with code already exists',
      });

      await expect(
        coinController.createCoin({
          code: 'ttt',
          name: 'teste',
          symbol: 'T',
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('update by code', () => {
    it('should update', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(getCoinByCode);

      jest.spyOn(coinRepository, 'update').mockResolvedValue(undefined);

      await expect(
        coinController.updateCoin(
          {
            name: 'teste',
            symbol: 'T',
          },
          'ttt',
        ),
      ).resolves.toEqual(undefined);
    });

    it('should not update because not found', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      jest.spyOn(coinRepository, 'update').mockResolvedValue(undefined);

      const error = new NotFoundException({
        message: 'Coins not found',
      });

      await expect(
        coinController.updateCoin(
          {
            name: 'teste',
            symbol: 'T',
          },
          'ttt',
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(getCoinByCode);

      jest.spyOn(coinRepository, 'delete').mockResolvedValue(undefined);

      await expect(coinController.deleteCoin('ttt')).resolves.toEqual(
        undefined,
      );
    });

    it('should delete', async () => {
      jest.spyOn(coinRepository, 'findByCode').mockResolvedValue(null);

      jest.spyOn(coinRepository, 'delete').mockResolvedValue(undefined);

      const error = new NotFoundException({
        message: 'Coins not found',
      });

      await expect(coinController.deleteCoin('ttt')).rejects.toThrow(error);
    });
  });
});
