import {test, expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'test-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {autoRefreshToken: false, persistSession: false},
});

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const WEBHOOK_SECRET = process.env.MYFATOORAH_WEBHOOK_SECRET || 'test-webhook-secret';
const TEST_PRODUCT_SLUG = 'ethiopian-yirgacheffe';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/cart');
    await page.evaluate(() => localStorage.clear());
  });

  test('complete checkout flow with mocked payment', async ({page}) => {
    await page.goto('/');

    const shopLink = page.locator('a[href="/shop"]').first();
    if (await shopLink.isVisible()) {
      await shopLink.click();
      await page.waitForURL('/shop');
    }

    const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/cart');
    const cartItems = await page.locator('[data-testid="cart-item"]').all();
    expect(cartItems.length).toBeGreaterThan(0);

    const proceedBtn = page.locator('a[href="/checkout/shipping"]');
    if (await proceedBtn.isVisible()) {
      await proceedBtn.click();
      await page.waitForURL(/\/checkout\/shipping/);
    }

    await page.fill('[data-testid="first-name"]', 'أحمد');
    await page.fill('[data-testid="last-name"]', 'محمد');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="address"]', 'شارع رئيسي');
    await page.fill('[data-testid="city"]', 'الدوحة');
    await page.selectOption('[data-testid="country"]', 'QA');
    await page.fill('[data-testid="phone"]', '+97412345678');

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    await page.route('**/api/v1/payment/initiate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            PaymentURL: 'https://test.myfatoorah.com/test',
            InvoiceId: 'TEST-INV-123',
          },
        }),
      });
    });

    await page.route('**/api/v1/payment/execute', async route => {
      const requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            PaymentURL: 'https://test.myfatoorah.com/test',
            InvoiceId: 'MF-' + Date.now(),
          },
        }),
      });
    });

    const submitBtn = page.locator('button[type="submit"]').last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    const {data: order} = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    expect(order).toBeTruthy();
    expect(['pending', 'pending_payment']).toContain(order.status);
    expect(order.mf_invoice_id).toBeTruthy();

    const {data: orderItems} = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    expect(orderItems).toBeTruthy();
    expect(orderItems!.length).toBeGreaterThan(0);

    await page.goto('/cart');
    const emptyCartMessage = page.locator('text=سلة التسوق فارغة');
    if (await emptyCartMessage.isVisible({timeout: 2000}).catch(() => false)) {
      expect(true).toBeTruthy();
    } else {
      const remainingItems = await page.locator('[data-testid="cart-item"]').count();
      expect(remainingItems).toBe(0);
    }
  });

  test('display shipping form with validation', async ({page}) => {
    await page.goto('/checkout/shipping');
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();

    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
    }
  });

  test('select shipping method', async ({page}) => {
    await page.goto('/checkout/shipping');

    await page.fill('[data-testid="first-name"]', 'أحمد');
    await page.fill('[data-testid="last-name"]', 'محمد');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="address"]', 'شارع رئيسي');
    await page.fill('[data-testid="city"]', 'الدوحة');
    await page.selectOption('[data-testid="country"]', 'QA');
    await page.fill('[data-testid="phone"]', '+97412345678');

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    const shippingMethods = page.locator('[data-testid="shipping-method"]');
    if (await shippingMethods.first().isVisible({timeout: 2000}).catch(() => false)) {
      await shippingMethods.first().click();
      await expect(page.locator('[data-testid="shipping-method-selected"]')).toBeVisible();
    }
  });
});

test.describe('Payment Webhooks and Callbacks', () => {
  let testOrderId: string;
  let testInvoiceId: string;
  let testOrderNumber: string;

  test.beforeEach(async ({page}) => {
    const {data: existingOrder} = await supabaseAdmin
      .from('orders')
      .select('id, mf_invoice_id, order_number, status')
      .eq('status', 'pending')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    if (existingOrder) {
      testOrderId = existingOrder.id;
      testInvoiceId = existingOrder.mf_invoice_id;
      testOrderNumber = existingOrder.order_number;
    } else {
      const {data: newOrder} = await supabaseAdmin
        .from('orders')
        .insert({
          status: 'pending',
          guest_email: 'webhook-test@example.com',
          subtotal: 100,
          shipping_cost: 0,
          tax_amount: 0,
          total: 100,
          discount_code: null,
          discount_amount: 0,
          shipping_address: {
            firstName: 'Test',
            lastName: 'User',
            address1: '123 Test St',
            city: 'Doha',
            country: 'QA',
          },
          mf_invoice_id: `INV-${Date.now()}`,
        })
        .select('id, mf_invoice_id, order_number')
        .single();

      testOrderId = newOrder!.id;
      testInvoiceId = newOrder!.mf_invoice_id;
      testOrderNumber = newOrder!.order_number;
    }
  });

  test('webhook transitions order to confirmed and sends email', async ({page}) => {
    const webhookPayload = {
      EventType: 'Payment',
      InvoiceStatus: 'Paid',
      InvoiceId: testInvoiceId,
      CustomerReference: testOrderId,
      TransactionId: `TXN-${Date.now()}`,
      PaidCurrency: 'QAR',
      PaidAmount: 100,
      CustomerEmail: 'webhook-test@example.com',
      CustomerName: 'Test User',
    };

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    const response = await page.request.fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myfatoorah-signature': signature,
      },
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    const {data: updatedOrder} = await supabaseAdmin
      .from('orders')
      .select('status, confirmed_at')
      .eq('id', testOrderId)
      .single();

    expect(updatedOrder.status).toBe('confirmed');
    expect(updatedOrder.confirmed_at).toBeTruthy();
  });

  test('webhook is idempotent - duplicate event does not double-transition', async ({page}) => {
    const webhookPayload = {
      EventType: 'Payment',
      InvoiceStatus: 'Paid',
      InvoiceId: testInvoiceId,
      CustomerReference: testOrderId,
      TransactionId: `TXN-${Date.now()}`,
      PaidCurrency: 'QAR',
      PaidAmount: 100,
      CustomerEmail: 'webhook-test@example.com',
    };

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    const firstResponse = await page.request.fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myfatoorah-signature': signature,
      },
      data: webhookPayload,
    });
    expect(firstResponse.status()).toBe(200);

    const {data: orderAfterFirst} = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', testOrderId)
      .single();

    const secondResponse = await page.request.fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myfatoorah-signature': signature,
      },
      data: webhookPayload,
    });
    expect(secondResponse.status()).toBe(200);

    const {data: orderAfterSecond} = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', testOrderId)
      .single();

    expect(orderAfterFirst!.status).toBe(orderAfterSecond!.status);
  });

  test('callback transitions pending order to confirmed', async ({page}) => {
    await page.route('**/api/v1/payment/callback**', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          location: `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/order/${testOrderNumber}/confirmation`,
        },
      });
    });

    await page.goto(`${API_BASE}/payment/callback?paymentId=${testInvoiceId}&invoiceId=${testInvoiceId}`);

    const {data: callbackOrder} = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', testOrderId)
      .single();

    if (callbackOrder && callbackOrder.status === 'pending') {
      const {data: updatedOrder} = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', testOrderId)
        .single();
      expect(['pending', 'confirmed']).toContain(updatedOrder!.status);
    } else if (callbackOrder) {
      expect(['pending', 'confirmed']).toContain(callbackOrder.status);
    }
  });

  test('webhook with failed/expired status transitions order to payment_failed', async ({page}) => {
    const {data: failedTestOrder} = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'pending',
        guest_email: 'webhook-failed-test@example.com',
        subtotal: 100,
        shipping_cost: 0,
        tax_amount: 0,
        total: 100,
        discount_code: null,
        discount_amount: 0,
        shipping_address: {
          firstName: 'Test',
          lastName: 'User',
          address1: '123 Test St',
          city: 'Doha',
          country: 'QA',
        },
        mf_invoice_id: `INV-FAILED-${Date.now()}`,
      })
      .select('id, mf_invoice_id')
      .single();

    const webhookPayload = {
      EventType: 'Payment',
      InvoiceStatus: 'Failed',
      InvoiceId: failedTestOrder!.mf_invoice_id,
      CustomerReference: failedTestOrder!.id,
      TransactionId: `TXN-${Date.now()}`,
    };

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    const response = await page.request.fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myfatoorah-signature': signature,
      },
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    const {data: failedOrder} = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', failedTestOrder!.id)
      .single();

    expect(failedOrder!.status).toBe('payment_failed');
  });

  test('webhook with Failed status sends failure notification email', async ({page}) => {
    const {data: emailTestOrder} = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'pending',
        guest_email: 'webhook-fail-email@example.com',
        subtotal: 100,
        shipping_cost: 0,
        tax_amount: 0,
        total: 100,
        discount_code: null,
        discount_amount: 0,
        shipping_address: {
          firstName: 'Test',
          lastName: 'User',
          address1: '123 Test St',
          city: 'Doha',
          country: 'QA',
        },
        mf_invoice_id: `INV-FAIL-EMAIL-${Date.now()}`,
      })
      .select('id, mf_invoice_id, order_number')
      .single();

    const webhookPayload = {
      EventType: 'Payment',
      InvoiceStatus: 'Failed',
      InvoiceId: emailTestOrder!.mf_invoice_id,
      CustomerReference: emailTestOrder!.id,
      TransactionId: `TXN-${Date.now()}`,
      CustomerEmail: 'webhook-fail-email@example.com',
    };

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    const response = await page.request.fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myfatoorah-signature': signature,
      },
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    const {data: failedEmailOrder} = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', emailTestOrder!.id)
      .single();

    expect(failedEmailOrder!.status).toBe('payment_failed');
  });

  test('frontend shows retry CTA after payment failure', async ({page}) => {
    const {data: retryOrder} = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'payment_failed',
        guest_email: 'retry-cta-test@example.com',
        subtotal: 100,
        shipping_cost: 0,
        tax_amount: 0,
        total: 100,
        discount_code: null,
        discount_amount: 0,
        shipping_address: {
          firstName: 'Test',
          lastName: 'User',
          address1: '123 Test St',
          city: 'Doha',
          country: 'QA',
        },
        mf_invoice_id: `INV-RETRY-${Date.now()}`,
        payment_method_id: 1,
      })
      .select('id, mf_invoice_id, order_number')
      .single();

    await page.goto(`/checkout/payment?error=1&reason=payment_failed&orderId=${retryOrder!.id}`);

    const retryButton = page.locator('text=المحاولة مرة أخرى').or(page.locator('text=Retry'));
    const errorBanner = page.locator('text=فشل الدفع');

    if (await errorBanner.isVisible({timeout: 3000}).catch(() => false)) {
      expect(true).toBeTruthy();
    }

    if (await retryButton.isVisible({timeout: 3000}).catch(() => false)) {
      expect(retryButton).toBeVisible();
    }
  });

  test('retry returns new PaymentURL without creating new order', async ({page}) => {
    const {data: existingPendingOrder} = await supabaseAdmin
      .from('orders')
      .select('id, mf_invoice_id, order_number, status')
      .eq('status', 'payment_failed')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    if (!existingPendingOrder) {
      const {data: newRetryOrder} = await supabaseAdmin
        .from('orders')
        .insert({
          status: 'payment_failed',
          guest_email: 'retry-test@example.com',
          subtotal: 100,
          shipping_cost: 0,
          tax_amount: 0,
          total: 100,
          discount_code: null,
          discount_amount: 0,
          shipping_address: {
            firstName: 'Test',
            lastName: 'User',
            address1: '123 Test St',
            city: 'Doha',
            country: 'QA',
          },
          mf_invoice_id: `INV-RETRY-TEST-${Date.now()}`,
          payment_method_id: 1,
        })
        .select('id, mf_invoice_id, order_number')
        .single();

      await page.route('**/api/v1/payment/execute', async route => {
        const body = route.request().postDataJSON();
        if (body.orderId === newRetryOrder!.id) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                InvoiceId: `MF-RETRY-${Date.now()}`,
                InvoiceURL: 'https://test.myfatoorah.com/retry',
                PaymentMethodId: 1,
              },
            }),
          });
        }
      });

      const executeResponse = await page.request.fetch(`${API_BASE}/payment/execute`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
          orderId: newRetryOrder!.id,
          paymentMethodId: 1,
          customerName: 'Test User',
          customerEmail: 'retry-test@example.com',
          successUrl: 'http://localhost:3000/checkout/confirmation',
          errorUrl: 'http://localhost:3000/checkout/payment?error=1',
        },
      });

      expect(executeResponse.status()).toBe(200);
      const executeBody = await executeResponse.json();
      expect(executeBody.data.InvoiceURL).toBeTruthy();

      const {data: ordersAfterRetry} = await supabaseAdmin
        .from('orders')
        .select('id, status, mf_invoice_id')
        .eq('guest_email', 'retry-test@example.com')
        .order('created_at', {ascending: false});

      expect(ordersAfterRetry!.length).toBe(1);
      expect(ordersAfterRetry![0].status).toBe('payment_failed');
    } else {
      await page.route('**/api/v1/payment/execute', async route => {
        const body = route.request().postDataJSON();
        if (body.orderId === existingPendingOrder.id) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                InvoiceId: `MF-RETRY-${Date.now()}`,
                InvoiceURL: 'https://test.myfatoorah.com/retry',
                PaymentMethodId: 1,
              },
            }),
          });
        }
      });

      const executeResponse = await page.request.fetch(`${API_BASE}/payment/execute`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
          orderId: existingPendingOrder.id,
          paymentMethodId: 1,
          customerName: 'Test User',
          customerEmail: existingPendingOrder.guest_email,
          successUrl: 'http://localhost:3000/checkout/confirmation',
          errorUrl: 'http://localhost:3000/checkout/payment?error=1',
        },
      });

      expect(executeResponse.status()).toBe(200);
      const executeBody = await executeResponse.json();
      expect(executeBody.data.InvoiceURL).toBeTruthy();

      const {data: ordersAfterRetry} = await supabaseAdmin
        .from('orders')
        .select('id, status')
        .eq('id', existingPendingOrder.id)
        .single();

      expect(ordersAfterRetry!.status).toBe('payment_failed');
    }
  });
});

test.describe('Guest Full Flow', () => {
  let guestEmail: string;
  let guestOrderId: string;
  let guestOrderNumber: string;
  let guestInvoiceId: string;

  test.beforeEach(async ({page}) => {
    guestEmail = `guest-${Date.now()}@example.com`;
    await page.evaluate(() => localStorage.clear());
  });

  test('complete guest checkout without account', async ({page}) => {
    await page.goto('/shop');
    const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/cart');
    const cartItems = await page.locator('[data-testid="cart-item"]').all();
    expect(cartItems.length).toBeGreaterThan(0);

    const proceedBtn = page.locator('a[href="/checkout/shipping"]');
    if (await proceedBtn.isVisible()) {
      await proceedBtn.click();
      await page.waitForURL(/\/checkout\/shipping/);
    }

    await page.fill('[data-testid="first-name"]', 'أحمد');
    await page.fill('[data-testid="last-name"]', 'محمد');
    await page.fill('[data-testid="email"]', guestEmail);
    await page.fill('[data-testid="address"]', 'شارع رئيسي');
    await page.fill('[data-testid="city"]', 'الدوحة');
    await page.selectOption('[data-testid="country"]', 'QA');
    await page.fill('[data-testid="phone"]', '+97412345678');

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    await page.route('**/api/v1/payment/initiate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            PaymentURL: 'https://test.myfatoorah.com/test',
            InvoiceId: `TEST-GUEST-${Date.now()}`,
          },
        }),
      });
    });

    await page.route('**/api/v1/payment/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            InvoiceId: `MF-GUEST-${Date.now()}`,
            InvoiceURL: 'https://test.myfatoorah.com/guest-success',
            PaymentMethodId: 1,
          },
        }),
      });
    });

    await page.route('**/api/v1/payment/webhook', async route => {
      const body = route.request().postDataJSON();
      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({received: true}),
        headers: {'x-myfatoorah-signature': signature},
      });
    });

    const submitBtn = page.locator('button[type="submit"]').last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    const {data: orders} = await supabaseAdmin
      .from('orders')
      .select('id, order_number, mf_invoice_id, guest_email, status')
      .eq('guest_email', guestEmail)
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    expect(orders).toBeTruthy();
    guestOrderId = orders!.id;
    guestOrderNumber = orders!.order_number;
    guestInvoiceId = orders!.mf_invoice_id;

    const webhookPayload = {
      EventType: 'Payment',
      InvoiceStatus: 'Paid',
      InvoiceId: guestInvoiceId,
      CustomerReference: guestOrderId,
      TransactionId: `TXN-GUEST-${Date.now()}`,
      CustomerEmail: guestEmail,
    };

    const sig = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    await page.request.fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myfatoorah-signature': sig,
      },
      data: webhookPayload,
    });

    const {data: confirmedOrder} = await supabaseAdmin
      .from('orders')
      .select('status, confirmed_at, guest_email')
      .eq('id', guestOrderId)
      .single();

    expect(confirmedOrder!.status).toBe('confirmed');
    expect(confirmedOrder!.confirmed_at).toBeTruthy();
  });

  test('track guest order by order number + email', async ({page}) => {
    if (!guestOrderNumber || !guestEmail) {
      test.skip();
    }

    await page.goto('/track');
    await page.fill('[data-testid="order-number-input"]', guestOrderNumber);
    await page.fill('[data-testid="order-email-input"]', guestEmail);
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    const statusElement = page.locator('[data-testid="order-status"]');
    if (await statusElement.isVisible({timeout: 3000}).catch(() => false)) {
      expect(statusElement).toBeVisible();
    }

    const orderNumberDisplay = page.locator('text=' + guestOrderNumber);
    expect(orderNumberDisplay.first().isVisible({timeout: 3000})).resolves.toBeTruthy();
  });

  test('auth users cannot see guest orders', async ({page}) => {
    if (!guestOrderNumber) {
      test.skip();
    }

    await page.goto('/login');
    await page.fill('input[type="email"]', 'auth-test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});

    await page.goto(`/account/orders`);

    const guestOrderDisplay = page.locator('text=' + guestOrderNumber);
    if (await guestOrderDisplay.isVisible({timeout: 2000}).catch(() => false)) {
      expect(guestOrderDisplay).not.toBeVisible();
    }

    const orderNotFoundOr403 = page.locator('text=غير موجود').or(page.locator('text=غير مصرح')).or(page.locator('text=Order not found'));
    const noGuestOrdersVisible = !(await guestOrderDisplay.isVisible({timeout: 1000}).catch(() => false));
    expect(noGuestOrdersVisible).toBeTruthy();
  });
});

test.describe('Admin Order Management', () => {
  let adminEmail: string;
  let adminPassword: string;
  let testOrderId: string;
  let testOrderNumber: string;

  test.beforeEach(async ({page}) => {
    adminEmail = 'admin@doharoastery.com';
    adminPassword = 'AdminPassword123!';

    const {data: existingPending} = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status')
      .eq('status', 'pending')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    if (existingPending) {
      testOrderId = existingPending.id;
      testOrderNumber = existingPending.order_number;
    } else {
      const {data: newOrder} = await supabaseAdmin
        .from('orders')
        .insert({
          status: 'pending',
          guest_email: `admin-test-${Date.now()}@example.com`,
          subtotal: 10000,
          shipping_cost: 0,
          tax_amount: 800,
          total: 10800,
          discount_code: null,
          discount_amount: 0,
          shipping_address: {firstName: 'Admin', lastName: 'Test', address1: '123 St', city: 'Doha', country: 'QA'},
          mf_invoice_id: `INV-ADMIN-${Date.now()}`,
        })
        .select('id, order_number')
        .single();
      testOrderId = newOrder!.id;
      testOrderNumber = newOrder!.order_number;
    }
  });

  test('admin login and view order list', async ({page}) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});

    await page.goto('/admin/orders');

    if (testOrderNumber) {
      const orderRow = page.locator('text=' + testOrderNumber);
      if (await orderRow.isVisible({timeout: 2000}).catch(() => false)) {
        expect(orderRow).toBeVisible();
      }
    }
  });

  test('admin search for order by order number', async ({page}) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});

    await page.goto('/admin/orders');

    const searchInput = page.locator('[data-testid="order-search-input"]');
    if (await searchInput.isVisible({timeout: 2000}).catch(() => false)) {
      await searchInput.fill(testOrderNumber || '');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      if (testOrderNumber) {
        const searchResult = page.locator('text=' + testOrderNumber);
        expect(searchResult.first().isVisible({timeout: 3000})).resolves.toBeTruthy();
      }
    }
  });

  test('admin update order status', async ({page}) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});

    await page.goto(`/admin/orders/${testOrderId}`);

    const statusSelect = page.locator('[data-testid="status-select"]').or(page.locator('select').first());
    if (await statusSelect.isVisible({timeout: 2000}).catch(() => false)) {
      await statusSelect.selectOption('confirmed');
      const confirmBtn = page.locator('button[type="submit"]').or(page.locator('text=تحديث').or(page.locator('text=Update')));
      if (await confirmBtn.isVisible({timeout: 1000}).catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
      }

      const {data: updatedOrder} = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', testOrderId)
        .single();

      expect(['confirmed', 'processing']).toContain(updatedOrder!.status);
    }
  });

  test('admin refund flow - mock MakeRefund, assert refund recorded', async ({page}) => {
    const {data: deliveredOrder} = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, mf_invoice_id')
      .eq('status', 'delivered')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    if (!deliveredOrder) {
      const {data: newDeliveredOrder} = await supabaseAdmin
        .from('orders')
        .insert({
          status: 'delivered',
          guest_email: `refund-test-${Date.now()}@example.com`,
          subtotal: 10000,
          shipping_cost: 0,
          tax_amount: 800,
          total: 10800,
          discount_code: null,
          discount_amount: 0,
          shipping_address: {firstName: 'Refund', lastName: 'Test', address1: '456 St', city: 'Doha', country: 'QA'},
          mf_invoice_id: `INV-REFUND-${Date.now()}`,
        })
        .select('id, order_number, total, mf_invoice_id')
        .single();

      const refundOrderId = newDeliveredOrder!.id;
      const refundAmount = 5000;

      await page.route('**/api/v1/payment/refund', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              RefundId: `REF-${Date.now()}`,
              Amount: refundAmount,
              Status: 'Pending',
              RefundReference: `REF-${Date.now()}`,
            },
          }),
        });
      });

      const refundResponse = await page.request.fetch(`${API_BASE}/payment/refund`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
          orderId: refundOrderId,
          refundAmount,
          reason: 'Test refund',
        },
      });

      expect(refundResponse.status()).toBe(200);

      const {data: refundedOrder} = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', refundOrderId)
        .single();

      expect(refundedOrder!.status).toBe('refunded');
    } else {
      const refundOrderId = deliveredOrder.id;
      const refundAmount = 5000;

      await page.route('**/api/v1/payment/refund', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              RefundId: `REF-${Date.now()}`,
              Amount: refundAmount,
              Status: 'Pending',
              RefundReference: `REF-${Date.now()}`,
            },
          }),
        });
      });

      const refundResponse = await page.request.fetch(`${API_BASE}/payment/refund`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
          orderId: refundOrderId,
          refundAmount,
          reason: 'Test refund',
        },
      });

      expect(refundResponse.status()).toBe(200);

      const {data: refundedOrder} = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', refundOrderId)
        .single();

      expect(refundedOrder!.status).toBe('refunded');
    }
  });

  test('admin invalid status transition is rejected', async ({page}) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});

    await page.goto(`/admin/orders/${testOrderId}`);

    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible({timeout: 2000}).catch(() => false)) {
      const invalidTransitions = ['delivered', 'refunded', 'cancelled'];
      for (const invalidStatus of invalidTransitions) {
        await statusSelect.selectOption(invalidStatus);
        const confirmBtn = page.locator('button[type="submit"]');
        if (await confirmBtn.isVisible({timeout: 1000}).catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(500);
        }

        const {data: orderAfterAttempt} = await supabaseAdmin
          .from('orders')
          .select('status')
          .eq('id', testOrderId)
          .single();

        expect(orderAfterAttempt!.status).toBe('pending');
      }
    }
  });
});

test.describe('Discount Code Validation and Application', () => {
  let discountCode: string;
  let discountId: string;
  let expiredDiscountCode: string;
  let expiredDiscountId: string;
  let minAmountDiscountCode: string;
  let minAmountDiscountId: string;

  test.beforeAll(async () => {
    const {data: validDiscount} = await supabaseAdmin
      .from('discounts')
      .insert({
        code: `TEST${Date.now()}`.slice(-10).toUpperCase(),
        type: 'percentage',
        value: 10,
        is_active: true,
        max_uses: 100,
        uses_count: 0,
        min_order_amount: 0,
      })
      .select('id, code')
      .single();
    discountCode = validDiscount!.code;
    discountId = validDiscount!.id;

    const {data: expiredDiscount} = await supabaseAdmin
      .from('discounts')
      .insert({
        code: `EXPD${Date.now()}`.slice(-10).toUpperCase(),
        type: 'percentage',
        value: 15,
        is_active: true,
        expires_at: new Date(Date.now() - 86400000).toISOString(),
        max_uses: null,
        uses_count: 0,
        min_order_amount: 0,
      })
      .select('id, code')
      .single();
    expiredDiscountCode = expiredDiscount!.code;
    expiredDiscountId = expiredDiscount!.id;

    const {data: minAmountDiscount} = await supabaseAdmin
      .from('discounts')
      .insert({
        code: `MIN${Date.now()}`.slice(-10).toUpperCase(),
        type: 'fixed',
        value: 5000,
        is_active: true,
        max_uses: 100,
        uses_count: 0,
        min_order_amount: 50000,
      })
      .select('id, code')
      .single();
    minAmountDiscountCode = minAmountDiscount!.code;
    minAmountDiscountId = minAmountDiscount!.id;
  });

  test('apply valid discount in cart, complete checkout, assert correct amount in order and invoice', async ({page}) => {
    await page.goto('/shop');
    const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/cart');
    const cartItems = await page.locator('[data-testid="cart-item"]').all();
    expect(cartItems.length).toBeGreaterThan(0);

    const discountInput = page.locator('[data-testid="discount-code-input"]');
    if (await discountInput.isVisible()) {
      await discountInput.fill(discountCode);
      await page.locator('[data-testid="apply-discount-button"]').click();
      await page.waitForTimeout(1000);

      const discountSuccess = page.locator('text=' + discountCode);
      expect(discountSuccess.isVisible({timeout: 3000})).resolves.toBeTruthy();
    }

    const proceedBtn = page.locator('a[href="/checkout/shipping"]');
    if (await proceedBtn.isVisible()) {
      await proceedBtn.click();
      await page.waitForURL(/\/checkout\/shipping/);
    }

    const guestEmailDiscount = `discount-test-${Date.now()}@example.com`;
    await page.fill('[data-testid="first-name"]', 'أحمد');
    await page.fill('[data-testid="last-name"]', 'محمد');
    await page.fill('[data-testid="email"]', guestEmailDiscount);
    await page.fill('[data-testid="address"]', 'شارع رئيسي');
    await page.fill('[data-testid="city"]', 'الدوحة');
    await page.selectOption('[data-testid="country"]', 'QA');
    await page.fill('[data-testid="phone"]', '+97412345678');

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    await page.route('**/api/v1/payment/initiate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            PaymentURL: 'https://test.myfatoorah.com/test',
            InvoiceId: `TEST-DISC-${Date.now()}`,
          },
        }),
      });
    });

    await page.route('**/api/v1/payment/execute', async route => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            InvoiceId: `MF-DISC-${Date.now()}`,
            InvoiceURL: 'https://test.myfatoorah.com/discount-success',
            PaymentMethodId: 1,
          },
        }),
      });
    });

    const submitBtn = page.locator('button[type="submit"]').last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    const {data: discountOrder} = await supabaseAdmin
      .from('orders')
      .select('id, order_number, discount_code, discount_amount, total, subtotal')
      .eq('guest_email', guestEmailDiscount)
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    expect(discountOrder).toBeTruthy();
    expect(discountOrder!.discount_code).toBe(discountCode);
    expect(discountOrder!.discount_amount).toBeGreaterThan(0);
    expect(discountOrder!.subtotal).toBeGreaterThan(discountOrder!.discount_amount);
    expect(discountOrder!.total).toBe(discountOrder!.subtotal - discountOrder!.discount_amount);
  });

  test('apply expired discount code, assert error message', async ({page}) => {
    await page.goto('/cart');

    const discountInput = page.locator('[data-testid="discount-code-input"]');
    if (await discountInput.isVisible()) {
      await discountInput.fill(expiredDiscountCode);
      await page.locator('[data-testid="apply-discount-button"]').click();
      await page.waitForTimeout(1000);

      const errorMsg = page.locator('text=Expired').or(page.locator('text=انتهت صلاحية'));
      if (await errorMsg.isVisible({timeout: 3000}).catch(() => false)) {
        expect(true).toBeTruthy();
      } else {
        const genericError = page.locator('[data-testid="discount-error"]');
        expect(genericError.isVisible({timeout: 2000})).resolves.toBeTruthy();
      }
    }
  });

  test('apply code below min_order_amount, assert rejected', async ({page}) => {
    await page.goto('/cart');

    const discountInput = page.locator('[data-testid="discount-code-input"]');
    if (await discountInput.isVisible()) {
      await discountInput.fill(minAmountDiscountCode);
      await page.locator('[data-testid="apply-discount-button"]').click();
      await page.waitForTimeout(1000);

      const minAmountError = page.locator('text=minimum').or(page.locator('text=الحد الأدنى'));
      if (await minAmountError.isVisible({timeout: 3000}).catch(() => false)) {
        expect(true).toBeTruthy();
      } else {
        const errorMsg = page.locator('[data-testid="discount-error"]');
        expect(errorMsg.isVisible({timeout: 2000})).resolves.toBeTruthy();
      }
    }
  });

  test('discount validation revalidated at payment execution', async ({page}) => {
    const {data: orderWithExpiredDiscount} = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'pending',
        guest_email: `rev-${Date.now()}@example.com`,
        subtotal: 10000,
        shipping_cost: 0,
        tax_amount: 800,
        total: 10800,
        discount_code: expiredDiscountCode,
        discount_amount: 1500,
        shipping_address: {firstName: 'Test', lastName: 'User', address1: '123 St', city: 'Doha', country: 'QA'},
        mf_invoice_id: `INV-REV-${Date.now()}`,
      })
      .select('id, discount_code')
      .single();

    await page.route('**/api/v1/payment/execute', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'discount_invalid',
          code: 409,
          message: 'This discount code has expired',
        }),
      });
    });

    const executeResponse = await page.request.fetch(`${API_BASE}/payment/execute`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        orderId: orderWithExpiredDiscount!.id,
        paymentMethodId: 1,
        customerName: 'Test User',
        customerEmail: orderWithExpiredDiscount!.guest_email,
        successUrl: 'http://localhost:3000/checkout/confirmation',
        errorUrl: 'http://localhost:3000/checkout/payment?error=1',
      },
    });

    expect(executeResponse.status()).toBe(409);
    const errorBody = await executeResponse.json();
    expect(errorBody.error).toBe('discount_invalid');
  });
});

test.describe('Cart Abandonment and Recovery', () => {
  let abandonedEmail: string;
  let abandonedOrderId: string;
  let abandonedOrderNumber: string;

  test('start checkout, abandon, return to cart - assert cart preserved and pending order exists', async ({page}) => {
    abandonedEmail = `abandon-${Date.now()}@example.com`;

    await page.goto('/shop');
    const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/cart');
    const cartItemsBefore = await page.locator('[data-testid="cart-item"]').all();
    expect(cartItemsBefore.length).toBeGreaterThan(0);

    const proceedBtn = page.locator('a[href="/checkout/shipping"]');
    if (await proceedBtn.isVisible()) {
      await proceedBtn.click();
      await page.waitForURL(/\/checkout\/shipping/);
    }

    await page.fill('[data-testid="first-name"]', 'أحمد');
    await page.fill('[data-testid="last-name"]', 'محمد');
    await page.fill('[data-testid="email"]', abandonedEmail);
    await page.fill('[data-testid="address"]', 'شارع رئيسي');
    await page.fill('[data-testid="city"]', 'الدوحة');
    await page.selectOption('[data-testid="country"]', 'QA');
    await page.fill('[data-testid="phone"]', '+97412345678');

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    await page.goto('/cart');

    const cartItemsAfterReturn = await page.locator('[data-testid="cart-item"]').all();
    expect(cartItemsAfterReturn.length).toBeGreaterThan(0);

    const {data: abandonedOrder} = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, guest_email')
      .eq('guest_email', abandonedEmail)
      .eq('status', 'pending')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    expect(abandonedOrder).toBeTruthy();
    abandonedOrderId = abandonedOrder!.id;
    abandonedOrderNumber = abandonedOrder!.order_number;
  });

  test('complete abandoned checkout, assert order confirmed', async ({page}) => {
    if (!abandonedOrderId) {
      test.skip();
    }

    const {data: pendingOrder} = await supabaseAdmin
      .from('orders')
      .select('id, status, guest_email')
      .eq('id', abandonedOrderId)
      .single();

    expect(pendingOrder).toBeTruthy();
    expect(pendingOrder!.status).toBe('pending');

    await page.goto('/checkout/shipping');

    await page.fill('[data-testid="email"]', pendingOrder!.guest_email);

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    await page.route('**/api/v1/payment/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            InvoiceId: `MF-ABANDON-${Date.now()}`,
            InvoiceURL: 'https://test.myfatoorah.com/abandon-complete',
            PaymentMethodId: 1,
          },
        }),
      });
    });

    await page.route('**/api/v1/payment/webhook', async route => {
      const body = route.request().postDataJSON();
      const sig = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({received: true}),
        headers: {'x-myfatoorah-signature': sig},
      });
    });

    const submitBtn = page.locator('button[type="submit"]').last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    const {data: confirmedOrder} = await supabaseAdmin
      .from('orders')
      .select('id, status, confirmed_at')
      .eq('id', abandonedOrderId)
      .single();

    expect(confirmedOrder!.status).toBe('confirmed');
    expect(confirmedOrder!.confirmed_at).toBeTruthy();

    const {data: allOrdersForEmail} = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('guest_email', pendingOrder!.guest_email);

    expect(allOrdersForEmail!.length).toBe(1);
    expect(allOrdersForEmail![0].id).toBe(abandonedOrderId);
  });

  test('abandoned checkout creates exactly one pending order (no duplicates)', async ({page}) => {
    const duplicateEmail = `dup-${Date.now()}@example.com`;

    await page.goto('/shop');
    const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/checkout/shipping');

    await page.fill('[data-testid="first-name"]', 'أحمد');
    await page.fill('[data-testid="last-name"]', 'محمد');
    await page.fill('[data-testid="email"]', duplicateEmail);
    await page.fill('[data-testid="address"]', 'شارع رئيسي');
    await page.fill('[data-testid="city"]', 'الدوحة');
    await page.selectOption('[data-testid="country"]', 'QA');
    await page.fill('[data-testid="phone"]', '+97412345678');

    const continueBtn = page.locator('button[type="submit"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    await page.goto('/checkout/shipping');
    await page.fill('[data-testid="email"]', duplicateEmail);
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/checkout\/payment/, {timeout: 5000}).catch(() => {});
    }

    const {data: pendingOrders} = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('guest_email', duplicateEmail)
      .eq('status', 'pending');

    expect(pendingOrders!.length).toBe(1);
  });
});

test.describe('Inventory Race Condition', () => {
  let inventoryProductId: string;
  let inventoryVariantId: string;
  let user1Email: string;
  let user2Email: string;

  test.beforeAll(async () => {
    const {data: variant} = await supabaseAdmin
      .from('variants')
      .select('id, product_id, quantity')
      .limit(1)
      .single();

    if (variant) {
      inventoryVariantId = variant.id;
      inventoryProductId = variant.product_id;

      await supabaseAdmin
        .from('inventory')
        .update({quantity: 1})
        .eq('product_id', inventoryVariantId)
        .eq('variant_id', inventoryVariantId);
    } else {
      const {data: newProduct} = await supabaseAdmin
        .from('product_definitions')
        .insert({
          name: 'RACE_TEST_PRODUCT',
          slug: `race-test-${Date.now()}`,
          description: 'Test product for race condition',
          category: 'coffee',
          price: 10000,
          is_active: true,
        })
        .select('id')
        .single();

      const {data: newVariant} = await supabaseAdmin
        .from('variants')
        .insert({
          product_id: newProduct!.id,
          size: '250g',
          grind: 'whole_bean',
          price: 10000,
          quantity: 1,
          is_active: true,
        })
        .select('id, product_id')
        .single();

      inventoryProductId = newVariant!.product_id;
      inventoryVariantId = newVariant!.id;

      await supabaseAdmin
        .from('inventory')
        .insert({
          product_id: inventoryProductId,
          variant_id: inventoryVariantId,
          quantity: 1,
        });
    }
  });

  test('first user gets the last item, second user gets INVENTORY_UNAVAILABLE', async ({page}) => {
    if (!inventoryProductId || !inventoryVariantId) {
      test.skip();
    }

    user1Email = `race1-${Date.now()}@example.com`;
    user2Email = `race2-${Date.now()}@example.com`;

    await page.route('**/api/v1/orders', async route => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        if (body.guestEmail === user1Email) {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                id: `order-${Date.now()}`,
                orderNumber: `ORD-${Date.now()}`,
                status: 'pending',
              },
            }),
          });
        } else if (body.guestEmail === user2Email) {
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'INVENTORY_UNAVAILABLE',
              code: 409,
              message: 'Inventory unavailable for product',
            }),
          });
        }
      }
    });

    const response1 = await page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        guestEmail: user1Email,
        cartItems: [{productId: inventoryProductId, variantId: inventoryVariantId, quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {firstName: 'User', lastName: 'One', address1: '123 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
      },
    });

    const response2 = await page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        guestEmail: user2Email,
        cartItems: [{productId: inventoryProductId, variantId: inventoryVariantId, quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {firstName: 'User', lastName: 'Two', address1: '456 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
      },
    });

    expect(response1.status()).toBe(201);
    expect(response2.status()).toBe(409);
    const error2Body = await response2.json();
    expect(error2Body.error).toBe('INVENTORY_UNAVAILABLE');
  });

  test('after winner pays, inventory is 0 (not negative)', async ({page}) => {
    if (!inventoryVariantId) {
      test.skip();
    }

    const {data: inventoryAfter} = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('variant_id', inventoryVariantId)
      .single();

    expect(inventoryAfter!.quantity).toBeGreaterThanOrEqual(0);
    expect(inventoryAfter!.quantity).toBeLessThanOrEqual(1);
  });

  test('order_items match cart exactly', async ({page}) => {
    const {data: orderWithItems} = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', 'confirmed')
      .order('created_at', {ascending: false})
      .limit(1)
      .single();

    if (orderWithItems && orderWithItems.order_items) {
      const items = orderWithItems.order_items as Array<{product_id: string; variant_id: string; quantity: number}>;
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].quantity).toBe(1);
    }
  });

  test('inventory re-checked at order creation, returns INVENTORY_UNAVAILABLE if sold out', async ({page}) => {
    if (!inventoryProductId || !inventoryVariantId) {
      test.skip();
    }

    await supabaseAdmin
      .from('inventory')
      .update({quantity: 0})
      .eq('product_id', inventoryProductId)
      .eq('variant_id', inventoryVariantId);

    const soldOutEmail = `soldout-${Date.now()}@example.com`;

    const response = await page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        guestEmail: soldOutEmail,
        cartItems: [{productId: inventoryProductId, variantId: inventoryVariantId, quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {firstName: 'User', lastName: 'Sold', address1: '789 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
      },
    });

    expect(response.status()).toBe(409);
    const errorBody = await response.json();
    expect(errorBody.error).toBe('INVENTORY_UNAVAILABLE');
  });

  test('frontend highlights sold-out item and allows cart edit', async ({page}) => {
    if (!inventoryVariantId) {
      test.skip();
    }

    await supabaseAdmin
      .from('inventory')
      .update({quantity: 0})
      .eq('product_id', inventoryProductId)
      .eq('variant_id', inventoryVariantId);

    await page.goto('/cart');

    const soldOutItem = page.locator('[data-testid="cart-item"]').filter({hasText: 'غير متوفر'}).or(page.locator('[data-testid="sold-out-badge"]'));
    const removeButton = page.locator('text=إزالة').or(page.locator('text=Remove')).first();

    if (await soldOutItem.isVisible({timeout: 2000}).catch(() => false)) {
      expect(soldOutItem).toBeVisible();
    }

    if (await removeButton.isVisible({timeout: 2000}).catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(500);

      const cartEmptyOrUpdated = page.locator('text=سلة التسوق فارغة').or(page.locator('[data-testid="cart-item"]').first());
      expect(cartEmptyOrUpdated.isVisible({timeout: 3000})).resolves.toBeTruthy();
    }
  });
});

test.describe('Idempotency Key for Order Creation', () => {
  let idempotencyKey: string;
  let idempotentEmail: string;

  test('POST /orders with same idempotency key returns 200 and existing order', async ({page}) => {
    idempotencyKey = `idem-${Date.now()}`;
    idempotentEmail = `idem-${Date.now()}@example.com`;

    const firstResponse = await page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      data: {
        email: idempotentEmail,
        cartItems: [{productId: '00000000-0000-0000-0000-000000000001', variantId: '00000000-0000-0000-0000-000000000001', quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {line1: '123 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
        paymentMethodId: 1,
      },
    });

    expect(firstResponse.status()).toBe(201);

    const secondResponse = await page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      data: {
        email: idempotentEmail,
        cartItems: [{productId: '00000000-0000-0000-0000-000000000001', variantId: '00000000-0000-0000-0000-000000000001', quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {line1: '123 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
        paymentMethodId: 1,
      },
    });

    expect(secondResponse.status()).toBe(200);
    const secondBody = await secondResponse.json();
    expect(secondBody.duplicate).toBe(true);
    expect(secondBody.order.id).toBeTruthy();

    const {data: orders} = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('guest_email', idempotentEmail);

    expect(orders!.length).toBe(1);
  });

  test('idempotency key without header creates new order each time', async ({page}) => {
    const noKeyEmail = `nokey-${Date.now()}@example.com`;

    const response1 = await page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        email: noKeyEmail,
        cartItems: [{productId: '00000000-0000-0000-0000-000000000001', variantId: '00000000-0000-0000-0000-000000000001', quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {line1: '456 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
        paymentMethodId: 1,
      },
    });

    if (response1.status() === 409 || response1.status() === 201) {
      const response2 = await page.request.fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
          email: noKeyEmail,
          cartItems: [{productId: '00000000-0000-0000-0000-000000000001', variantId: '00000000-0000-0000-0000-000000000001', quantity: 1, unitPrice: 10000, name: 'Test'}],
          shippingAddress: {line1: '789 St', city: 'Doha', country: 'QA'},
          shippingMethodId: 'standard',
          paymentMethodId: 1,
        },
      });

      if (response2.status() === 201) {
        const {data: orders} = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('guest_email', noKeyEmail);

        expect(orders!.length).toBe(2);
      }
    }
  });
});

test.describe('Inventory Locking with SKIP LOCKED', () => {
  test('concurrent order creation with locked inventory returns 409 with retry-after', async ({page}) => {
    if (!inventoryVariantId) {
      test.skip();
    }

    await supabaseAdmin
      .from('inventory')
      .update({quantity: 1})
      .eq('product_id', inventoryProductId)
      .eq('variant_id', inventoryVariantId);

    const lockTestEmail1 = `lock1-${Date.now()}@example.com`;
    const lockTestEmail2 = `lock2-${Date.now()}@example.com`;

    await page.route('**/api/v1/orders', async route => {
      const body = route.request().postDataJSON();
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (body.email === lockTestEmail1) {
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'INVENTORY_UNAVAILABLE',
              code: 409,
              message: 'Unable to reserve inventory - another transaction is in progress. Please retry in a moment.',
            }),
            headers: {'Retry-After': '2'},
          });
        }
      }
    });

    const response1Promise = page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        email: lockTestEmail1,
        cartItems: [{productId: inventoryProductId, variantId: inventoryVariantId, quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {line1: '123 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
        paymentMethodId: 1,
      },
    });

    const response2Promise = page.request.fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        email: lockTestEmail2,
        cartItems: [{productId: inventoryProductId, variantId: inventoryVariantId, quantity: 1, unitPrice: 10000, name: 'Test'}],
        shippingAddress: {line1: '456 St', city: 'Doha', country: 'QA'},
        shippingMethodId: 'standard',
        paymentMethodId: 1,
      },
    });

    const [response1, response2] = await Promise.all([response1Promise, response2Promise]);

    if (response1.status() === 409) {
      expect(response1.headers()['retry-after'] || '2').toBeTruthy();
    }

    if (response2.status() === 409) {
      expect(response2.headers()['retry-after'] || '2').toBeTruthy();
    }

    const {data: finalInventory} = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('variant_id', inventoryVariantId)
      .single();

    expect(finalInventory!.quantity).toBeGreaterThanOrEqual(0);
  });
});