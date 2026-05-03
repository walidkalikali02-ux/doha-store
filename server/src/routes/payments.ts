import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createHmac, randomUUID } from 'crypto';
import { MyFatoorahClient, getMyFatoorahClient, MyfatoorahApiError } from '../lib/myfatoorah';
import { supabaseAdmin } from '../lib/supabase';
import { logInfo, logError } from '../lib/logger';
import { updateStatus } from '../services/orders';
import * as orderItemsService from '../services/orderItems';
import { orderConfirmation } from '../templates/order-confirmation';
import { sendEmail } from '../lib/email';

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

const router = express.Router();

export const InitiatePaymentSchema = z.object({
  InvoiceAmount: z.number().positive('Invoice amount must be positive'),
  CurrencyIso: z.string().min(3).max(3).default('QAR'),
});

export const PaymentMethodsSchema = z.object({
  orderId: z.string().uuid().optional(),
  currencyIso: z.string().min(3).max(3).default('QAR'),
}).strict();

interface PaymentMethodResponse {
  PaymentMethodId: number;
  PaymentMethodEn: string;
  PaymentMethodAr: string;
  ServiceCharge: number;
  TotalAmount: number;
  CurrencyIso: string;
  IsDirectPayment: boolean;
  IsEmbeddedSupported: boolean;
  ImageUrl: string;
}

router.post('/initiate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = InitiatePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'validation_error',
        code: 422,
        message: 'Invalid request body',
        details: validation.error.errors,
      });
    }

    const { InvoiceAmount, CurrencyIso } = validation.data;

    let client: MyFatoorahClient;
    try {
      client = getMyFatoorahClient();
    } catch (err) {
      const error = err as Error;
      logError({
        errorCode: 'MYFATOORAH_NOT_CONFIGURED',
        errorMessage: error.message,
      });
      return res.status(503).json({
        error: 'payment_provider_unavailable',
        code: 503,
        message: 'Payment provider is not configured',
      });
    }

    logInfo({
      event: 'initiate_payment_request',
      message: 'Initiating MyFatoorah payment',
      invoiceAmount: InvoiceAmount,
      currencyIso: CurrencyIso,
    });

    const result = await client.initiatePayment({
      InvoiceAmount,
      CurrencyIso,
    });

    logInfo({
      event: 'initiate_payment_success',
      message: 'Payment methods retrieved',
      paymentMethodId: result.PaymentMethodId,
      invoiceId: result.InvoiceId,
    });

    const paymentMethods: PaymentMethodResponse[] = [];

    if (result.PaymentMethodId) {
      paymentMethods.push({
        PaymentMethodId: result.PaymentMethodId,
        PaymentMethodEn: 'Default Payment',
        PaymentMethodAr: 'الدفع الافتراضي',
        ServiceCharge: 0,
        TotalAmount: InvoiceAmount,
        CurrencyIso,
        IsDirectPayment: true,
        IsEmbeddedSupported: false,
        ImageUrl: '',
      });
    }

    res.json({
      Data: {
        PaymentMethods: paymentMethods,
        InvoiceId: result.InvoiceId,
        PaymentURL: result.PaymentURL,
      },
    });
  } catch (error) {
    const err = error as Error;
    logError({
      errorCode: 'INITIATE_PAYMENT_FAILED',
      errorMessage: err.message,
    });

    if (err.message.includes('MYFATOORAH_API_KEY')) {
      return res.status(503).json({
        error: 'payment_provider_unavailable',
        code: 503,
        message: 'Payment provider is not configured',
      });
    }

    return res.status(500).json({
      error: 'payment_initiation_failed',
      code: 500,
      message: 'Failed to initiate payment',
    });
  }
});

router.post('/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const InvoiceItemSchema = z.object({
      ItemName: z.string().min(1),
      Quantity: z.number().int().positive(),
      UnitPrice: z.number().positive(),
    });

    const ExecutePaymentSchema = z.object({
      orderId: z.string().uuid('Invalid order ID'),
      paymentMethodId: z.number().int().positive('Invalid payment method ID'),
      customerName: z.string().min(1, 'Customer name is required'),
      customerEmail: z.string().email('Invalid email format'),
      customerMobile: z.string().optional(),
      successUrl: z.string().url('Invalid success URL'),
      errorUrl: z.string().url('Invalid error URL'),
      InvoiceItems: z.array(InvoiceItemSchema).optional(),
      displayCurrencyIso: z.string().min(3).max(3).optional(),
      language: z.string().optional(),
    });

    const validation = ExecutePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'validation_error',
        code: 422,
        message: 'Invalid request body',
        details: validation.error.errors,
      });
    }

    const { orderId, paymentMethodId, customerName, customerEmail, customerMobile, successUrl, errorUrl, InvoiceItems, displayCurrencyIso, language } = validation.data;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        error: 'order_not_found',
        code: 404,
        message: 'Order not found',
      });
    }

    if (!['pending', 'payment_failed'].includes(order.status)) {
      return res.status(409).json({
        error: 'order_not_retryable',
        code: 409,
        message: `Order cannot retry payment in status: ${order.status}`,
      });
    }

    let retrying = false;
    if (order.status === 'payment_failed') {
      retrying = true;
      logInfo({ event: 'payment_retry', message: `Retrying payment for order ${orderId}`, orderId, previousStatus: order.status });
    }

    if (order.discount_code) {
      const discountValidation = await import('../services/discount').then(m => m.validateDiscount(order.discount_code, order.subtotal));
      if (!discountValidation.valid) {
        const errorMessage = discountValidation.error?.includes('expired')
          ? 'This discount code has expired'
          : discountValidation.error?.includes('limit')
          ? 'This discount code has reached its usage limit'
          : discountValidation.error?.includes('not yet active')
          ? 'This discount code is not yet active'
          : 'This discount code is no longer valid';

        return res.status(409).json({
          error: 'discount_invalid',
          code: 409,
          message: errorMessage,
        });
      }
    }

    let invoiceItems = InvoiceItems;

    if (!invoiceItems || invoiceItems.length === 0) {
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('*, product:product_definitions(name)')
        .eq('order_id', orderId);

      if (orderItems && orderItems.length > 0) {
        invoiceItems = orderItems.map((item: any) => ({
          ItemName: item.product?.name || `Item ${item.id}`,
          Quantity: item.quantity,
          UnitPrice: Number(item.unit_price),
        }));
      }
    }

    const invoiceValue = invoiceItems && invoiceItems.length > 0
      ? invoiceItems.reduce((sum: number, item: any) => sum + item.UnitPrice * item.Quantity, 0)
      : order.total;

    const executeRequest: any = {
      InvoiceValue: invoiceValue,
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: customerMobile || '',
      CustomerReference: orderId,
      PaymentMethodId: paymentMethodId,
      SuccessUrl: successUrl,
      ErrorUrl: errorUrl,
      DisplayCurrencyIso: displayCurrencyIso || 'QAR',
      Language: language || 'en',
    };

    if (invoiceItems && invoiceItems.length > 0) {
      executeRequest.InvoiceItems = invoiceItems;
    }

    let result;
    try {
      result = await client.executePayment(executeRequest);
    } catch (err) {
      if (err instanceof MyfatoorahApiError) {
        logError({
          errorCode: 'MYFATOORAH_API_ERROR',
          errorMessage: err.message,
          orderId,
          stack: err.stack,
        });
        return res.status(422).json({
          error: 'payment_failed',
          code: 422,
          message: err.message,
          details: err.validationErrors,
        });
      }
      throw err;
    }

    await supabaseAdmin
      .from('orders')
      .update({
        mf_invoice_id: result.InvoiceId.toString(),
        mf_payment_url: result.InvoiceURL,
      })
      .eq('id', orderId);

    logInfo({
      event: retrying ? 'execute_payment_retry_success' : 'execute_payment_success',
      message: retrying ? `Payment retry successful for order ${orderId}` : 'Payment executed, invoice created',
      orderId,
      invoiceId: result.InvoiceId,
      invoiceURL: result.InvoiceURL,
      isRetry: retrying,
    });

    res.json({
      Data: {
        InvoiceId: result.InvoiceId,
        InvoiceURL: result.InvoiceURL,
        PaymentMethodId: result.PaymentMethodId,
      },
    });
  } catch (error) {
    const err = error as Error;
    logError({
      errorCode: 'EXECUTE_PAYMENT_FAILED',
      errorMessage: err.message,
    });

    return res.status(500).json({
      error: 'payment_execution_failed',
      code: 500,
      message: 'Failed to execute payment',
    });
  }
});

router.post('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const StatusSchema = z.object({
      Key: z.string().min(1),
      KeyType: z.enum(['InvoiceId', 'PaymentId', 'CustomerReference']).default('InvoiceId'),
    });

    const validation = StatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'validation_error',
        code: 422,
        message: 'Invalid request body',
        details: validation.error.errors,
      });
    }

    let client: MyFatoorahClient;
    try {
      client = getMyFatoorahClient();
    } catch (err) {
      return res.status(503).json({
        error: 'payment_provider_unavailable',
        code: 503,
        message: 'Payment provider is not configured',
      });
    }

    const result = await client.getPaymentStatus(validation.data);

    res.json({
      Data: {
        InvoiceId: result.InvoiceId,
        InvoiceStatus: result.InvoiceStatus,
        InvoiceValue: result.InvoiceValue,
        PaidAt: result.PaidAt,
        CustomerName: result.CustomerName,
        CustomerEmail: result.CustomerEmail,
      },
    });
  } catch (error) {
    const err = error as Error;
    logError({
      errorCode: 'PAYMENT_STATUS_FAILED',
      errorMessage: err.message,
    });

    return res.status(500).json({
      error: 'payment_status_failed',
      code: 500,
      message: 'Failed to get payment status',
    });
  }
});

const WebhookPayloadSchema = z.object({
  EventType: z.string().optional(),
  InvoiceId: z.number(),
  InvoiceStatus: z.string(),
  InvoiceValue: z.number(),
  PaidAt: z.string().optional(),
  CustomerName: z.string().optional(),
  CustomerEmail: z.string().optional(),
  CustomerReference: z.string().optional(),
  PaymentMethod: z.string().optional(),
  TransactionId: z.number().optional(),
  PaidCurrency: z.string().optional(),
  PaidAmount: z.number().optional(),
});

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const rawBody = req.body as Buffer;
    const signature = req.headers['x-myfatoorah-signature'] as string;
    const eventId = randomUUID();

    logInfo({
      eventId,
      event: 'webhook_received',
      message: 'Incoming MyFatoorah webhook',
      hasSignature: !!signature,
      contentLength: rawBody.length,
    });

    if (!signature) {
      logError({ eventId, errorCode: 'WEBHOOK_MISSING_SIGNATURE', message: 'Missing x-myfatoorah-signature header' });
      return res.status(200).json({ received: true });
    }

    const secret = process.env.MYFATOORAH_WEBHOOK_SECRET;
    if (!secret) {
      logError({ eventId, errorCode: 'WEBHOOK_SECRET_NOT_CONFIGURED', message: 'MYFATOORAH_WEBHOOK_SECRET is not set' });
      return res.status(200).json({ received: true });
    }

    const expectedSignature = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (signature !== expectedSignature) {
      logError({ eventId, errorCode: 'WEBHOOK_SIGNATURE_MISMATCH', message: 'HMAC signature mismatch' });
      return res.status(200).json({ received: true });
    }

    let payload: z.infer<typeof WebhookPayloadSchema>;
    try {
      payload = WebhookPayloadSchema.parse(JSON.parse(rawBody.toString()));
    } catch (parseError) {
      logError({ eventId, errorCode: 'WEBHOOK_PARSE_FAILED', message: String(parseError) });
      return res.status(200).json({ received: true });
    }

    logInfo({
      eventId,
      event: 'webhook_event_received',
      message: `MyFatoorah webhook event: ${payload.EventType || 'unknown'} for invoice ${payload.InvoiceId}`,
      eventType: payload.EventType,
      invoiceId: payload.InvoiceId,
      invoiceStatus: payload.InvoiceStatus,
      customerReference: payload.CustomerReference,
      transactionId: payload.TransactionId,
      paidCurrency: payload.PaidCurrency,
      paidAmount: payload.PaidAmount,
      paymentMethod: payload.PaymentMethod,
    });

    if (!payload.CustomerReference) {
      logError({
        eventId,
        errorCode: 'WEBHOOK_MISSING_REFERENCE',
        message: 'CustomerReference not found in webhook payload',
        invoiceId: payload.InvoiceId,
        invoiceStatus: payload.InvoiceStatus,
      });
      return res.status(200).json({ received: true });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, mf_invoice_id, order_number')
      .eq('id', payload.CustomerReference)
      .single();

    if (orderError || !order) {
      logError({
        eventId,
        errorCode: 'WEBHOOK_ORDER_NOT_FOUND',
        message: `Order not found for CustomerReference: ${payload.CustomerReference}`,
        invoiceId: payload.InvoiceId,
        orderId: payload.CustomerReference,
      });
      return res.status(200).json({ received: true });
    }

    const eventType = payload.EventType || 'InvoiceNotification';
    const status = payload.InvoiceStatus.toLowerCase();

    if (eventType === 'Payment' && status === 'paid') {
      const { data: orderByInvoice, error: orderByInvoiceError } = await supabaseAdmin
        .from('orders')
        .select('id, status, mf_invoice_id, order_number, guest_email, customer_id')
        .eq('mf_invoice_id', payload.InvoiceId.toString())
        .single();

      if (orderByInvoiceError || !orderByInvoice) {
        logError({
          eventId,
          errorCode: 'WEBHOOK_INVOICE_NOT_FOUND',
          message: `Order not found for InvoiceId: ${payload.InvoiceId}`,
          invoiceId: payload.InvoiceId,
          orderId: payload.CustomerReference,
        });
        return res.status(200).json({ received: true });
      }

      if (orderByInvoice.status !== 'pending') {
        logInfo({
          eventId,
          event: 'webhook_idempotency_skipped',
          message: `Order ${orderByInvoice.id} already in status ${orderByInvoice.status} - skipping duplicate webhook`,
          orderId: orderByInvoice.id,
          invoiceId: payload.InvoiceId,
          currentStatus: orderByInvoice.status,
          invoiceStatus: payload.InvoiceStatus,
        });
        return res.status(200).json({ received: true });
      }

      try {
        await updateStatus(orderByInvoice.id, 'confirmed');
        logInfo({
          eventId,
          event: 'order_status_transitioned',
          message: `Order ${orderByInvoice.id} transitioned from pending to confirmed via webhook`,
          orderId: orderByInvoice.id,
          invoiceId: payload.InvoiceId,
          transactionId: payload.TransactionId,
          previousStatus: 'pending',
          newStatus: 'confirmed',
        });
      } catch (err) {
        const updateErr = err as Error;
        logError({
          eventId,
          errorCode: 'WEBHOOK_STATUS_UPDATE_FAILED',
          message: updateErr.message,
          orderId: orderByInvoice.id,
          invoiceId: payload.InvoiceId,
        });
        return res.status(200).json({ received: true });
      }

      logInfo({
        eventId,
        event: 'payment_confirmed',
        message: `Payment confirmed for order ${orderByInvoice.id}`,
        orderId: orderByInvoice.id,
        invoiceId: payload.InvoiceId,
        transactionId: payload.TransactionId,
        paidCurrency: payload.PaidCurrency,
        paidAmount: payload.PaidAmount,
        customerEmail: payload.CustomerEmail,
      });

      try {
        const emailTo = orderByInvoice.guest_email;
        if (emailTo) {
          const emailEventId = randomUUID();
          logInfo({
            eventId: emailEventId,
            event: 'email_send_started',
            message: `Sending confirmation email for order ${orderByInvoice.id}`,
            orderId: orderByInvoice.id,
            invoiceId: payload.InvoiceId,
            emailTo,
          });

          const orderWithItems = await orderItemsService.findByOrderId(orderByInvoice.id);
          const orderHtml = orderConfirmation({ ...orderByInvoice, items: orderWithItems }, FRONTEND_BASE_URL);

          await sendEmail(
            emailTo,
            `Order Confirmed - #${orderByInvoice.order_number}`,
            orderHtml
          );

          logInfo({
            eventId: emailEventId,
            event: 'email_send_completed',
            message: `Confirmation email sent successfully for order ${orderByInvoice.id}`,
            orderId: orderByInvoice.id,
            emailTo,
          });
        }
      } catch (emailErr) {
        logError({
          eventId,
          errorCode: 'EMAIL_SEND_FAILED',
          message: (emailErr as Error).message,
          orderId: orderByInvoice.id,
          invoiceId: payload.InvoiceId,
        });
      }

      return res.status(200).json({ received: true });
    }

    if ((eventType === 'Payment' && status === 'failed') || status === 'expired') {
      const { data: failedOrder, error: failedOrderError } = await supabaseAdmin
        .from('orders')
        .select('id, status, order_number, guest_email, mf_payment_url')
        .eq('mf_invoice_id', payload.InvoiceId.toString())
        .single();

      if (failedOrderError || !failedOrder) {
        logError({
          eventId,
          errorCode: 'WEBHOOK_INVOICE_NOT_FOUND',
          message: `Order not found for InvoiceId: ${payload.InvoiceId}`,
          invoiceId: payload.InvoiceId,
        });
        return res.status(200).json({ received: true });
      }

      if (failedOrder.status !== 'pending') {
        logInfo({
          eventId,
          event: 'webhook_idempotency_skipped',
          message: `Order ${failedOrder.id} already in status ${failedOrder.status} - skipping duplicate webhook`,
          orderId: failedOrder.id,
          invoiceId: payload.InvoiceId,
          currentStatus: failedOrder.status,
        });
        return res.status(200).json({ received: true });
      }

      try {
        await updateStatus(failedOrder.id, 'payment_failed');
        logInfo({
          eventId,
          event: 'order_status_transitioned',
          message: `Order ${failedOrder.id} transitioned from pending to payment_failed via webhook`,
          orderId: failedOrder.id,
          invoiceId: payload.InvoiceId,
          previousStatus: 'pending',
          newStatus: 'payment_failed',
        });
      } catch (err) {
        const updateErr = err as Error;
        logError({
          eventId,
          errorCode: 'WEBHOOK_STATUS_UPDATE_FAILED',
          message: updateErr.message,
          orderId: failedOrder.id,
          invoiceId: payload.InvoiceId,
        });
        return res.status(200).json({ received: true });
      }

      logInfo({
        eventId,
        event: 'payment_failed',
        message: `Payment failed for order ${failedOrder.id}: ${status}`,
        orderId: failedOrder.id,
        invoiceId: payload.InvoiceId,
        transactionId: payload.TransactionId,
        failureReason: payload.InvoiceStatus,
        paymentMethod: payload.PaymentMethod,
      });

      try {
        const emailTo = failedOrder.guest_email;
        if (emailTo && failedOrder.mf_payment_url) {
          const emailEventId = randomUUID();
          logInfo({
            eventId: emailEventId,
            event: 'email_send_started',
            message: `Sending payment failure email for order ${failedOrder.id}`,
            orderId: failedOrder.id,
            invoiceId: payload.InvoiceId,
            emailTo,
          });

          await sendEmail(
            emailTo,
            `Payment Failed - Order #${failedOrder.order_number}`,
            `<h1>Payment Unsuccessful</h1>
            <p>Unfortunately, payment for order #${failedOrder.order_number} could not be processed.</p>
            <p>Reason: ${payload.InvoiceStatus}</p>
            <p>You can retry payment by clicking the link below:</p>
            <a href="${failedOrder.mf_payment_url}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:#fff;text-decoration:none;border-radius:4px;">Retry Payment</a>
            <p style="margin-top:20px;color:#666;font-size:12px;">This payment link will expire in 24 hours.</p>`
          );

          logInfo({
            eventId: emailEventId,
            event: 'email_send_completed',
            message: `Payment failure email sent for order ${failedOrder.id}`,
            orderId: failedOrder.id,
            emailTo,
          });
        }
      } catch (emailErr) {
        logError({
          eventId,
          errorCode: 'EMAIL_SEND_FAILED',
          message: (emailErr as Error).message,
          orderId: failedOrder.id,
          invoiceId: payload.InvoiceId,
        });
      }

      return res.status(200).json({ received: true });
    }

    if (eventType === 'PaymentTransaction' || eventType === 'InvoiceNotification') {
      const isPaid = status === 'paid' || status === 'completed' || status === 'captured';

      if (isPaid && order.status === 'pending') {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', payload.CustomerReference);

        logInfo({
          eventId,
          event: 'order_status_transitioned',
          message: `Order ${payload.CustomerReference} confirmed via ${eventType} webhook`,
          orderId: payload.CustomerReference,
          invoiceId: payload.InvoiceId,
          previousStatus: order.status,
          newStatus: 'confirmed',
          eventType,
        });
      } else if ((status === 'failed' || status === 'declined' || status === 'cancelled') && order.status === 'pending') {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'payment_failed' })
          .eq('id', payload.CustomerReference);

        logInfo({
          eventId,
          event: 'order_status_transitioned',
          message: `Order ${payload.CustomerReference} payment_failed via ${eventType} webhook`,
          orderId: payload.CustomerReference,
          invoiceId: payload.InvoiceId,
          previousStatus: order.status,
          newStatus: 'payment_failed',
          eventType,
        });
      } else {
        logInfo({
          eventId,
          event: 'webhook_idempotency_skipped',
          message: `Webhook skipped - order ${payload.CustomerReference} already in status ${order.status}`,
          orderId: payload.CustomerReference,
          invoiceId: payload.InvoiceId,
          currentStatus: order.status,
          invoiceStatus: status,
          eventType,
        });
      }
    } else {
      logInfo({
        eventId,
        event: 'webhook_unhandled_event_type',
        message: `Unhandled EventType: ${eventType}`,
        orderId: payload.CustomerReference,
        invoiceId: payload.InvoiceId,
        eventType,
      });
    }

    return res.status(200).json({ received: true });
  }
);

router.get('/callback', async (req: Request, res: Response) => {
  const { paymentId, invoiceId, orderId } = req.query;
  const eventId = randomUUID();

  logInfo({
    eventId,
    event: 'payment_callback_received',
    message: 'MyFatoorah payment callback received',
    paymentId,
    invoiceId,
    orderId,
  });

  if (!paymentId && !invoiceId) {
    logError({ eventId, errorCode: 'CALLBACK_MISSING_PARAMS', message: 'No paymentId or invoiceId in callback', paymentId, invoiceId, orderId });
    return res.redirect(`${FRONTEND_BASE_URL}/checkout/error?reason=invalid_callback`);
  }

  let client: MyFatoorahClient;
  try {
    client = getMyFatoorahClient();
  } catch (err) {
    logError({ eventId, errorCode: 'MYFATOORAH_NOT_CONFIGURED', message: (err as Error).message });
    return res.redirect(`${FRONTEND_BASE_URL}/checkout/error?reason=payment_provider_unavailable`);
  }

  let paymentStatus: { InvoiceId: number; InvoiceStatus: string; InvoiceValue: number; CustomerName: string; CustomerEmail: string; PaidAt?: string };
  let targetOrderId = orderId as string | undefined;

  try {
    if (paymentId) {
      paymentStatus = await client.getPaymentStatus({ Key: paymentId as string, KeyType: 'PaymentId' }) as any;
    } else if (invoiceId) {
      paymentStatus = await client.getPaymentStatus({ Key: invoiceId as string, KeyType: 'InvoiceId' }) as any;
    } else {
      throw new Error('No identifier provided');
    }
  } catch (err) {
    logError({ eventId, errorCode: 'PAYMENT_STATUS_LOOKUP_FAILED', message: (err as Error).message, paymentId, invoiceId });
    return res.redirect(`${FRONTEND_BASE_URL}/checkout/error?reason=payment_status_lookup_failed`);
  }

  if (!targetOrderId && paymentStatus) {
    const { data: orderByInvoice } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('mf_invoice_id', paymentStatus.InvoiceId.toString())
      .single();
    targetOrderId = orderByInvoice?.id;
  }

  logInfo({
    eventId,
    event: 'payment_callback_processed',
    message: `Callback processed - Status: ${paymentStatus.InvoiceStatus}`,
    orderId: targetOrderId,
    invoiceId: paymentStatus.InvoiceId,
    invoiceStatus: paymentStatus.InvoiceStatus,
    paymentId,
  });

  const status = paymentStatus.InvoiceStatus.toLowerCase();
  const isPaid = status === 'paid' || status === 'completed' || status === 'captured';

  if (isPaid && targetOrderId) {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, status, order_number, guest_email')
      .eq('id', targetOrderId)
      .single();

    if (order && order.status === 'pending') {
      try {
        await updateStatus(order.id, 'confirmed');
        logInfo({
          eventId,
          event: 'order_status_transitioned',
          message: `Order ${order.id} confirmed via callback fallback`,
          orderId: order.id,
          previousStatus: 'pending',
          newStatus: 'confirmed',
          source: 'callback',
        });

        if (order.guest_email) {
          const emailEventId = randomUUID();
          logInfo({
            eventId: emailEventId,
            event: 'email_send_started',
            message: `Sending confirmation email for order ${order.id} via callback`,
            orderId: order.id,
            emailTo: order.guest_email,
          });

          await sendEmail(
            order.guest_email,
            `Order Confirmed - #${order.order_number}`,
            `<h1>Thank you for your order!</h1><p>Your order #${order.order_number} has been confirmed.</p>`
          ).catch((e) => {
            logError({ eventId: emailEventId, errorCode: 'EMAIL_SEND_FAILED', message: (e as Error).message, orderId: order.id });
          });

          logInfo({
            eventId: emailEventId,
            event: 'email_send_completed',
            message: `Confirmation email sent for order ${order.id} via callback`,
            orderId: order.id,
            emailTo: order.guest_email,
          });
        }
      } catch (err) {
        logError({ eventId, errorCode: 'CALLBACK_STATUS_UPDATE_FAILED', message: (err as Error).message, orderId: targetOrderId });
      }
    } else if (order) {
      logInfo({
        eventId,
        event: 'callback_idempotency_skipped',
        message: `Order ${order.id} already in status ${order.status} - skipping callback`,
        orderId: order.id,
        currentStatus: order.status,
      });
    }

    return res.redirect(`${FRONTEND_BASE_URL}/order/${order?.order_number || targetOrderId}/confirmation`);
  }

  if (status === 'failed' || status === 'expired') {
    logInfo({
      eventId,
      event: 'callback_payment_failed',
      message: `Payment failed/expired via callback for order ${targetOrderId}`,
      orderId: targetOrderId,
      invoiceStatus: status,
    });
    return res.redirect(`${FRONTEND_BASE_URL}/checkout/payment-failed?orderId=${targetOrderId || ''}`);
  }

  logInfo({
    eventId,
    event: 'callback_redirect_to_status',
    message: `Callback redirecting to order status page`,
    orderId: targetOrderId,
    invoiceStatus: status,
  });

  return res.redirect(`${FRONTEND_BASE_URL}/order/${targetOrderId || ''}/status`);
});

export default router;