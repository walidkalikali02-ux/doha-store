export function orderConfirmation(order: any, baseUrl: string): string {
  const trackUrl = `${baseUrl}/track/${order.order_number}`;
  const items = order.items || [];
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName || item.name || 'Item'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
    ${items.length > 0 ? `
      <h2>Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    ` : ''}
    <p>We'll send you updates as your order ships.</p>
    <p><a href="${trackUrl}">Track your order</a></p>
  `;
}

export default orderConfirmation;