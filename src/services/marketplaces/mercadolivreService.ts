import axios from 'axios';
import { MarketplaceType } from '@/types/integration';

const ML_CLIENT_ID = process.env.ML_CLIENT_ID;
const ML_CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
const ML_REDIRECT_URI = process.env.ML_REDIRECT_URI;
const ML_URL = 'https://api.mercadolibre.com';

export class MercadoLivreService {
  static async getMarketplaceAuthInfo(code: string): Promise<{
    marketplaceType: MarketplaceType;
    accessToken: string;
    refreshToken: string;
    sellerId: string;
    storeName: string;
  }> {
    const {
      data: { access_token, refresh_token, user_id },
    } = await axios.post(`${ML_URL}/oauth/token`, {
      grant_type: 'authorization_code',
      code,
      client_id: ML_CLIENT_ID,
      client_secret: ML_CLIENT_SECRET,
      redirect_uri: ML_REDIRECT_URI,
      code_verifier: '25a1106a6a207280d3a0d558a816cbdf6711e8860062a7b22fff838eef56e828',
    });

    const {
      data: { nickname },
    } = await axios.get(`${ML_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return {
      marketplaceType: MarketplaceType.MERCADOLIVRE,
      accessToken: access_token,
      refreshToken: refresh_token,
      sellerId: user_id,
      storeName: nickname,
    };
  }
}
