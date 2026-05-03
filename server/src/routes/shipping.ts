import express from 'express';
import type {Request, Response} from 'express';
import {getShippingRates, determineZone} from '../services/shipping';
import {logShippingRateRequest} from '../lib/logger';

const router = express.Router();

interface ShippingQuery {
  city?: string;
  area?: string;
  country?: string;
  weight?: string;
  value?: string;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const {address, cartItems} = req.body;

    if (!address || !cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({error: 'invalid_request', message: 'address and cartItems are required'});
    }

    const {methods} = await getShippingRates(address, cartItems);

    const zoneCode = determineZone(address);
    logShippingRateRequest({
      addressZone: zoneCode,
      methodSelected: 'none',
      cost: 0,
    });

    res.json({methods});
  } catch (error) {
    console.error('Shipping rates error:', error);
    res.status(500).json({error: 'server_error', message: 'Failed to calculate shipping rates'});
  }
});

router.get('/rates', async (req: Request, res: Response) => {
  try {
    const {city, area, country, weight, value} = req.query as ShippingQuery;

    if (!weight || !value) {
      return res.status(400).json({error: 'missing_required_fields', message: 'weight and value are required'});
    }

    const cartWeight = parseFloat(weight);
    const cartValue = parseFloat(value);

    if (isNaN(cartWeight) || cartWeight < 0 || isNaN(cartValue) || cartValue < 0) {
      return res.status(400).json({error: 'invalid_values', message: 'weight and value must be positive numbers'});
    }

    const address = {city, area, country};
    const cartItems = [{productId: 'dummy', quantity: 1, price: cartValue, weight: cartWeight}];

    const {methods} = await getShippingRates(address, cartItems);

    const zoneCode = determineZone(address);
    logShippingRateRequest({
      addressZone: zoneCode,
      methodSelected: 'none',
      cost: 0,
    });

    res.json({methods});
  } catch (error) {
    console.error('Shipping rates error:', error);
    res.status(500).json({error: 'server_error', message: 'Failed to calculate shipping rates'});
  }
});

export default router;