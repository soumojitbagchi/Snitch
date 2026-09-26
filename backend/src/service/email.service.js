import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.GOOGLE_USER,
        pass: config.GOOGLE_AUTH_APP_PASSWORD,
    },
});

transport.verify((error) => {
    if (error) console.error("Email service is unavailable:", error.message);
    else console.log("Email service is ready");
});

const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sendEmail = async ({ subject, to, html }) => {
    const info = await transport.sendMail({
        from: config.GOOGLE_USER,
        to,
        subject,
        html,
    });
    console.log(`Email sent to ${to}`);
    return info;
};

export const sendWelcomeEmail = ({ name, email }) => sendEmail({
    to: email,
    subject: "Welcome to Snitch",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Welcome to Snitch. Your account is ready to use.</p>`,
});

export const sendOrderConfirmationEmail = ({
    name,
    email,
    orderId,
    paymentId,
    amount,
    currency,
    items = [],
    subtotal = null,
    discount = 0,
    coupon = null,
}) => {
    const itemRows = items.map((item) => {
        const details = [item.size ? `Size: ${item.size}` : "", item.color ? `Color: ${item.color}` : ""]
            .filter(Boolean)
            .join(" · ");
        const imageCell = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="64" height="80" style="width:64px;height:80px;object-fit:cover;display:block;" />`
            : `<span style="color:#999;">No image</span>`;
        return `
        <tr>
            <td style="text-align:center;">${imageCell}</td>
            <td>
                <strong>${escapeHtml(item.title)}</strong>
                ${details ? `<br><span style="color:#666;font-size:12px;">${escapeHtml(details)}</span>` : ""}
                ${item.unitPrice != null ? `<br><span style="color:#666;font-size:12px;">${escapeHtml(item.unitPrice)} ${escapeHtml(item.currency || currency)} each</span>` : ""}
            </td>
            <td style="text-align:center;">${escapeHtml(item.quantity)}</td>
            <td style="text-align:right;">${escapeHtml(item.lineTotal)} ${escapeHtml(item.currency || currency)}</td>
        </tr>`;
    }).join("");

    return sendEmail({
        to: email,
        subject: `Snitch order confirmed: ${orderId}`,
        html: `
            <p>Hi ${escapeHtml(name)},</p>
            <p>Your payment was verified and your order is confirmed.</p>
            <p><strong>Order:</strong> ${escapeHtml(orderId)}<br>
            <strong>Payment:</strong> ${escapeHtml(paymentId)}<br>
            ${discount > 0 ? `<span>Subtotal: ${escapeHtml(subtotal ?? amount)} ${escapeHtml(currency)}</span><br>
            <span>Coupon ${escapeHtml(coupon || "")}: −${escapeHtml(discount)} ${escapeHtml(currency)}</span><br>` : ""}
            <strong>Total:</strong> ${escapeHtml(amount)} ${escapeHtml(currency)}</p>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px;">
                <thead><tr><th>Image</th><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>${itemRows}</tbody>
            </table>`,
    });
};

export default sendEmail;
