import { MarketplaceType } from '../types/integration';
import { MercadoLivreService } from './marketplaces/mercadolivreService';

const factories: Record<MarketplaceType | string, any> = {
  [MarketplaceType.MERCADOLIVRE]: MercadoLivreService,
};

const marketplaceFactory = async (marketplaceType: MarketplaceType, code: string) => {
  return factories[marketplaceType].getMarketplaceAuthInfo(code);
};

export default marketplaceFactory;
