import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// sokotz.com is verified with Resend, so emails send from our own domain.
const FROM_ADDRESS = 'Soko <notifications@sokotz.com>';

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - skipping email send.');
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Never let a failed email break the calling request (order placement,
    // status update, etc). Just log it so it can be investigated later.
    console.error('Failed to send email:', err);
  }
}

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export function newOrderEmailForSeller(params: {
  orderNumber: number;
  customerName: string;
  totalPrice: number;
  itemsSummary: string;
}) {
  return {
    subject: `New order #SK-${params.orderNumber.toString().padStart(5, '0')} on Soko`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>You have a new order!</h2>
        <p><strong>Order:</strong> #SK-${params.orderNumber.toString().padStart(5, '0')}</p>
        <p><strong>Customer:</strong> ${params.customerName}</p>
        <p><strong>Items:</strong> ${params.itemsSummary}</p>
        <p><strong>Total:</strong> ${formatTZS(params.totalPrice)}</p>
        <p>Log in to your Soko dashboard to confirm this order.</p>
      </div>
    `,
  };
}

export function orderStatusEmailForCustomer(params: {
  orderNumber: number;
  businessName: string;
  status: string;
}) {
  const statusLabel: Record<string, string> = {
    CONFIRMED: 'confirmed',
    PROCESSING: 'is now being processed',
    READY: 'is ready',
    DELIVERED: 'has been delivered',
    CANCELLED: 'was cancelled',
  };
  const label = statusLabel[params.status] || params.status.toLowerCase();
  return {
    subject: `Your Soko order #SK-${params.orderNumber.toString().padStart(5, '0')} ${label}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Order update</h2>
        <p>Your order <strong>#SK-${params.orderNumber.toString().padStart(5, '0')}</strong> from <strong>${params.businessName}</strong> ${label}.</p>
      </div>
    `,
  };
}

export function orderCancelledEmailForSeller(params: {
  orderNumber: number;
  customerName: string;
}) {
  return {
    subject: `Order #SK-${params.orderNumber.toString().padStart(5, '0')} was cancelled`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Order cancelled</h2>
        <p><strong>${params.customerName}</strong> cancelled order <strong>#SK-${params.orderNumber.toString().padStart(5, '0')}</strong>.</p>
      </div>
    `,
  };
}

export function priceDropEmailForCustomer(params: {
  productName: string;
  oldPrice: number;
  newPrice: number;
  productUrl: string;
}) {
  return {
    subject: `Price drop: ${params.productName} on Soko`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Price drop on an item in your wishlist!</h2>
        <p><strong>${params.productName}</strong> dropped from ${formatTZS(params.oldPrice)} to <strong>${formatTZS(params.newPrice)}</strong>.</p>
        <p><a href="${params.productUrl}">View product</a></p>
      </div>
    `,
  };
}