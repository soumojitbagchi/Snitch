import sendEmail from "./email.service.js";

const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const sendLowStockAlert = ({ email, name, items }) => sendEmail({
    to: email,
    subject: `Low stock alert: ${items.length} variant(s) need restock`,
    html: `<p>Hi ${escapeHtml(name || "seller")},</p>`
        + `<p>The following variants are running low:</p>`
        + `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
});
