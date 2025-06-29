import { IntegrationStatus, MarketplaceType } from '../../types/integration';
import { MarketplaceIntegrationSchema } from '../MarketplaceIntegration';

describe('MarketplaceIntegration Model', () => {
  it('valida um objeto válido', () => {
    const valid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      marketplaceType: MarketplaceType.MERCADOLIVRE,
      accessToken: 'token',
      status: IntegrationStatus.ACTIVE,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    const { error } = MarketplaceIntegrationSchema.validate(valid);
    expect(error).toBeUndefined();
  });
});
