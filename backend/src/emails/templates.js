const baseStyle = `
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f172a;
`;

const container = (title, body, footerNote = '') => `
  <div style="${baseStyle} background:#f8fafc;padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;
      box-shadow:0 15px 45px rgba(15,23,42,0.08);">
      <h1 style="margin-top:0;font-size:22px;color:#065f46;">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#1f2937;">${body}</div>
      <p style="font-size:12px;color:#94a3b8;margin-top:32px;">
        ${footerNote || 'Thank you for supporting independent farmers on GreenHarvest.'}
      </p>
    </div>
  </div>
`;

const money = (amount) => `$${Number(amount).toFixed(2)}`;

const listItems = (items = []) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 0;">${item.name} × ${item.quantity}</td>
          <td style="padding:6px 0;text-align:right;">${money(item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join('');

const timelineHint = (status) => `
  <p style="margin:24px 0 0;font-weight:600;color:#047857;">Current status: ${status}</p>
`;

const templates = {
  welcome: ({ name, role }) => {
    const roleCopy =
      role === 'farmer'
        ? 'Your account is ready! You can start adding products to your inventory immediately.'
        : 'You can browse the catalog, build a cart, and check out in minutes.';
    return {
      subject: 'Welcome to GreenHarvest',
      html: container(
        `Hi ${name || 'there'}, welcome aboard!`,
        `<p>We are thrilled to have you on GreenHarvest.</p>
         <p>${roleCopy}</p>
         <p>Need help? Just reply to this email.</p>`
      ),
      text: `Welcome to GreenHarvest! ${roleCopy}`,
    };
  },
  orderConfirmation: ({ customerName, orderId, total, items }) => ({
    subject: `Order #${orderId} confirmed`,
    html: container(
      `Thanks, ${customerName}!`,
      `
        <p>Your order is confirmed and our farmers are getting it ready.</p>
        <table style="width:100%;font-size:14px;border-top:1px solid #e2e8f0;margin-top:16px;">
          ${listItems(items)}
          <tr>
            <td style="padding-top:8px;font-weight:700;">Total</td>
            <td style="padding-top:8px;text-align:right;font-weight:700;">${money(total)}</td>
          </tr>
        </table>
        ${timelineHint('Pending')}
      `
    ),
    text: `Order ${orderId} confirmed. Total ${money(total)}.`,
  }),
  newOrderForFarmer: ({ farmerName, orderId, items }) => ({
    subject: `New order #${orderId} awaiting action`,
    html: container(
      `Fresh order for you, ${farmerName}`,
      `
        <p>A customer just bought your produce. Please accept or reject it soon.</p>
        <table style="width:100%;font-size:14px;border-top:1px solid #e2e8f0;margin-top:16px;">
          ${listItems(items)}
        </table>
        ${timelineHint('Pending your review')}
      `
    ),
    text: `New order ${orderId} waiting for your confirmation.`,
  }),
  orderStatusUpdate: ({ customerName, status, note, orderId }) => ({
    subject: `Order #${orderId} is now ${status}`,
    html: container(
      `Hi ${customerName},`,
      `
        <p>Your order just moved to <strong>${status}</strong>.</p>
        ${note ? `<p>Update: ${note}</p>` : ''}
        ${timelineHint(status)}
      `
    ),
    text: `Order ${orderId} status: ${status}. ${note || ''}`.trim(),
  }),
  farmerDecision: ({ farmerName, approved }) => ({
    subject: `Your farmer account was ${approved ? 'approved' : 'reviewed'}`,
    html: container(
      `Hi ${farmerName},`,
      approved
        ? '<p>Great news! Your farmer profile is now approved. You can publish products immediately.</p>'
        : '<p>We reviewed your application and need more info before approval. Please check the dashboard for notes.</p>'
    ),
    text: approved
      ? 'Your farmer profile is approved.'
      : 'We need more information before approving your farmer profile.',
  }),
  lowStock: ({ farmerName, productName, stock }) => ({
    subject: `Low Stock Alert: ${productName}`,
    html: container(
      `Heads up, ${farmerName}!`,
      `<p>Your product <strong>${productName}</strong> is running low on stock.</p>
       <p>Current Stock: <strong>${stock}</strong></p>
       <p>Please restock soon to keep selling.</p>`
    ),
    text: `Low stock alert for ${productName}. Current stock: ${stock}.`,
  }),
  productDecision: ({ farmerName, productName, status, note }) => ({
    subject: `Product Update: ${productName} was ${status}`,
    html: container(
      `Hi ${farmerName},`,
      `<p>Your product <strong>${productName}</strong> has been <strong>${status}</strong> by our admin team.</p>
       ${note ? `<p><strong>Admin Note:</strong> ${note}</p>` : ''}
       ${status === 'approved' ? '<p>It is now live in the marketplace!</p>' : '<p>Please check the note and resubmit if needed.</p>'}`
    ),
    text: `Product ${productName} was ${status}. ${note || ''}`,
  }),
};

export const renderTemplate = (name, data) => {
  const factory = templates[name];
  if (!factory) {
    throw new Error(`Unknown email template: ${name}`);
  }
  return factory(data);
};






