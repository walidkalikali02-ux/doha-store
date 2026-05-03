import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MyFatoorah API configuration
const MYFATOORAH_API_KEY = process.env.VITE_MYFATOORAH_API_KEY || '';
const MYFATOORAH_BASE_URL = process.env.VITE_MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com';

// Proxy endpoints
app.post('/api/myfatoorah/initiate-payment', async (req, res) => {
  try {
    const { InvoiceAmount, CurrencyIso } = req.body;
    
    console.log('→ MyFatoorah InitiatePayment:', { InvoiceAmount, CurrencyIso });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        InvoiceAmount,
        CurrencyIso: CurrencyIso || 'QAR',
      }),
    });

    console.log('← MyFatoorah status:', response.status, response.statusText);
    
    const text = await response.text();
    console.log('← MyFatoorah raw response:', text.slice(0, 500));
    
    if (!text) {
      res.status(502).json({ error: 'Empty response from MyFatoorah', status: response.status });
      return;
    }
    
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error('InitiatePayment error:', error);
    res.status(500).json({ error: 'Failed to initiate payment', details: String(error) });
  }
});

app.post('/api/myfatoorah/execute-payment', async (req, res) => {
  try {
    const {
      InvoiceValue,
      CustomerName,
      CustomerEmail,
      CustomerMobile,
      CustomerReference,
      DisplayCurrencyIso,
      PaymentMethodId,
      SuccessUrl,
      ErrorUrl,
      Language,
    } = req.body;

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/ExecutePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
      },
      body: JSON.stringify({
        InvoiceValue,
        CustomerName,
        CustomerEmail,
        CustomerMobile,
        CustomerReference,
        DisplayCurrencyIso: DisplayCurrencyIso || 'QAR',
        PaymentMethodId,
        SuccessUrl,
        ErrorUrl,
        Language: Language || 'ar',
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ExecutePayment error:', error);
    res.status(500).json({ error: 'Failed to execute payment' });
  }
});

app.post('/api/myfatoorah/payment-status', async (req, res) => {
  try {
    const { Key, KeyType } = req.body;

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/PaymentStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
      },
      body: JSON.stringify({
        Key,
        KeyType: KeyType || 'InvoiceId',
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('PaymentStatus error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 MyFatoorah proxy ready at /api/myfatoorah/*`);
});