// test/stripe.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import MockDate from 'mockdate';

import { StripeService } from '../src/stripe/stripe.service';
import { SubscriptionDuration } from '../src/stripe/dto/create-subscription.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaPostgresService } from '../src/prisma/prisma.service';

describe('StripeService - changeSubscriptionPlan', () => {
  let service: StripeService;
  let mockPrisma: any;
  let mockStripe: any;
  let mockConfig: any;

  const mockPrices = {
    monthly: 'price_monthly_123',
    semestrial: 'price_semestrial_456',
    annual: 'price_annual_789',
  };

  beforeEach(async () => {
    // --- 1) Mock PrismaPostgresService
    mockPrisma = {
      user: {
        // on ne l'utilise plus dans changeSubscriptionPlan
        findUnique: jest.fn(),
      },
      subscription: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    // --- 2) Mock Stripe client
    mockStripe = {
      subscriptions: {
        retrieve: jest.fn(),
        update: jest.fn(),
      },
    };

    // --- 3) Mock ConfigService
    mockConfig = {
      get: (key: string) => {
        const cfg: Record<string, string> = {
          STRIPE_SECRET_KEY: 'sk_test',
          STRIPE_WEBHOOK_SECRET: 'whsec',
          PRICE_COMPANY_MONTHLY: mockPrices.monthly,
          PRICE_COMPANY_SEMESTRIAL: mockPrices.semestrial,
          PRICE_COMPANY_ANNUAL: mockPrices.annual,
          PRICE_INDIVIDUAL_ANNUAL: 'price_indiv',
        };
        return cfg[key];
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: PrismaPostgresService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get(StripeService);
    // injecte notre mock Stripe
    (service as any).stripe = mockStripe;
    // ** stub de l'autorisation pour bypasser ForbiddenException **
    jest
      .spyOn(service as any, 'checkUserCanManageSubscription')
      .mockResolvedValue('e1');
  });

  afterEach(() => {
    MockDate.reset();
    jest.resetAllMocks();
  });

  it('planifie le prochain billing à la fin de l’ancien cycle', async () => {
    // on fige au 15/01/2025
    MockDate.set('2025-01-15T00:00:00Z');

    // base a un subscription courant jusqu'au 01/02/2025
    const end = new Date('2025-02-01T00:00:00Z');
    const ts = Math.floor(end.getTime() / 1000);

    mockPrisma.subscription.findFirst.mockResolvedValue({
      stripe_subscription_id: 'sub_1',
      status: 'active',
      price_id: mockPrices.monthly,
      entity_id: 'e1',
    });

    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
      current_period_end: ts,
      items: { data: [{ id: 'item_1', price: { id: mockPrices.monthly } }] },
    });
    // Stripe retourne la même échéance, mais avec le nouveau price dans l'item
    mockStripe.subscriptions.update.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
      current_period_end: ts,
      items: { data: [{ id: 'item_1', price: { id: mockPrices.annual } }] },
    });

    mockPrisma.subscription.update.mockResolvedValue({});

    const res = await service.changeSubscriptionPlan('u1', SubscriptionDuration.ANNUAL);

    expect(res.subscriptionId).toBe('sub_1');
    expect(res.status).toBe('active');
    expect(res.nextBillingDate.toISOString()).toBe(end.toISOString());

    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_1', {
      proration_behavior: 'none',
      items: [{ id: 'item_1', price: mockPrices.annual }],
    });
  });

  it('erreur si pas d’abonnement actif', async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    await expect(
      service.changeSubscriptionPlan('u1', SubscriptionDuration.MONTHLY),
    ).rejects.toThrow(BadRequestException);
  });

  it('erreur si durée invalide', async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      stripe_subscription_id: 'sub_2',
      status: 'active',
      price_id: mockPrices.monthly,
      entity_id: 'e1',
    });
    // @ts-expect-error
    await expect(service.changeSubscriptionPlan('u1', 'xxx')).rejects.toThrow(BadRequestException);
  });
});
