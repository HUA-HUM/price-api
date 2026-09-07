import { GetProfitabilityInteractor } from './getProfitability';
import { GetProfitabilityRequest } from './getProfitability.types';
import { MadreProductStatusDto } from '../../entitis/madre-api/getPrice/dto/MadreProductStatusDto';
import { TaxCategory } from '../../entitis/madre-api/getTaxes/TaxCategory';

const DOLAR = { buy: 1000, sell: 1050, officialBuy: 900 };

const productStatus = (sku: string): MadreProductStatusDto => ({
  sku,
  price: 100,
  amazonPrice: 90,
  maxWeight: 2,
  stock: 5,
  status: 'active',
});

const taxes = (idMla: string): TaxCategory => ({
  id: 1,
  id_mla: idMla,
  categoria_arancelaria: 'test',
  die: 0.2,
  te: 0.03,
  iva: 0.21,
  derechos: 0.2,
  composicion_conf_automeli_iva: 0.21,
  composicion_conf_automeli_imp2: 0,
  composicion_conf_automeli_imp3: 0,
  compuesto: null,
  codigo_categoria_automeli: 'X',
});

const request = (mla: string, sku: string): GetProfitabilityRequest => ({
  mla,
  sku,
  categoryId: 'MLA62527',
  publicationType: 'gold_special',
  salePrice: 100000,
  meliContributionPercentage: 0,
});

/**
 * Arma el interactor con los 5 fetchers mockeados. `failCommissionFor` es la
 * lista de MLAs cuya comision debe explotar, que es el caso que dispara el bug
 * original: un item rompia el Promise.all y se perdia el lote de 50 entero.
 */
function buildInteractor({
  failCommissionFor = [],
  failDolar = false,
}: { failCommissionFor?: string[]; failDolar?: boolean } = {}) {
  const commissionCalls: string[] = [];

  const interactor = new GetProfitabilityInteractor(
    {
      executeMany: async (skus: string[]) =>
        new Map(skus.map((sku) => [sku, productStatus(sku)])),
    } as never,
    {
      execute: async () => {
        if (failDolar) {
          throw new Error('CriptoYa caido');
        }
        return DOLAR;
      },
    } as never,
    {
      executeMany: async (ids: string[]) =>
        new Map(ids.map((id) => [id, taxes(id)])),
    } as never,
    { executeMany: async () => new Map() } as never,
    {
      execute: async ({ mla }: { mla: string }) => {
        commissionCalls.push(mla);
        if (failCommissionFor.includes(mla)) {
          throw new Error('Request failed with status code 500');
        }
        return { percentage: 14, fixedFee: 0, grossAmount: null };
      },
    } as never,
  );

  return { interactor, commissionCalls };
}

describe('GetProfitabilityInteractor bulk resiliency', () => {
  it('un item que falla no tumba a los demas del lote', async () => {
    const { interactor } = buildInteractor({ failCommissionFor: ['MLA2'] });

    const results = await interactor.executeDetailedBulk([
      request('MLA1', 'B0DQL4CXT1'),
      request('MLA2', 'B0DQL4CXT2'),
      request('MLA3', 'B0DQL4CXT3'),
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].unresolved).toBeUndefined();
    expect(results[2].unresolved).toBeUndefined();
  });

  it('marca el item que fallo con unresolved y respeta su posicion', async () => {
    const { interactor } = buildInteractor({ failCommissionFor: ['MLA2'] });

    const results = await interactor.executeDetailedBulk([
      request('MLA1', 'B0DQL4CXT1'),
      request('MLA2', 'B0DQL4CXT2'),
      request('MLA3', 'B0DQL4CXT3'),
    ]);

    expect(results[1].unresolved).toBe(true);
    expect(results[1].input.mla).toBe('MLA2');
  });

  it('expone el fallo como status.resolved=false, no como "no rentable"', async () => {
    const { interactor } = buildInteractor({ failCommissionFor: ['MLA2'] });

    const responses = await interactor.executeBulk([
      request('MLA1', 'B0DQL4CXT1'),
      request('MLA2', 'B0DQL4CXT2'),
    ]);

    expect(responses[1].status.resolved).toBe(false);
    expect(responses[0].status.resolved).toBe(true);
  });

  it('pide la comision de todos los items aunque uno falle', async () => {
    const { interactor, commissionCalls } = buildInteractor({
      failCommissionFor: ['MLA1'],
    });

    await interactor.executeDetailedBulk([
      request('MLA1', 'B0DQL4CXT1'),
      request('MLA2', 'B0DQL4CXT2'),
      request('MLA3', 'B0DQL4CXT3'),
    ]);

    expect(commissionCalls).toEqual(['MLA1', 'MLA2', 'MLA3']);
  });

  it('si falla una dependencia compartida el lote entero falla', async () => {
    const { interactor } = buildInteractor({ failDolar: true });

    await expect(
      interactor.executeDetailedBulk([
        request('MLA1', 'B0DQL4CXT1'),
        request('MLA2', 'B0DQL4CXT2'),
      ]),
    ).rejects.toThrow('CriptoYa caido');
  });
});
