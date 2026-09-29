import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import mongoose from "mongoose";

// Exercise the actual handlers with offline model/cache doubles. Never load app,
// credentials, Redis, the payment gateway, or a database connection.
const source = readFileSync(new URL("../src/controller/seller.controller.js", import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace(/^export /gm, "");
const sellerId = new mongoose.Types.ObjectId();
const paymentId = new mongoose.Types.ObjectId();
const productId = new mongoose.Types.ObjectId();
const variantId = new mongoose.Types.ObjectId();
const item = { productId, variantId, quantity: 2, lineTotal: 200 };
const product = { _id: productId, seller: sellerId, variant: [] };
const query = (value) => ({ select() { return this; }, populate() { return this; }, lean: async () => value });
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const request = (body = {}) => ({ user: { _id: sellerId }, params: { paymentId, id: paymentId }, query: {}, body });
function handlers(overrides = {}) {
    const dependencies = {
        mongoose,
        Payment: {},
        Product: { find: () => query([product]) },
        Order: {},
        Review: {},
        ReturnRequest: {},
        Coupon: {},
        sendLowStockAlert: async () => {},
        del: async () => true,
        ...overrides,
    };
    return new Function(...Object.keys(dependencies), `${source}\nreturn { updateOrderStatus, decideReturn, getSellerOrder, getAttentionFeed, restockVariant, getSellerSettlements };`)(...Object.values(dependencies));
}

test("editing a product preserves numeric stock", () => {
    const dashboard = readFileSync(new URL("../../frontend/src/features/product/UI/SellerDashboard.jsx", import.meta.url), "utf8");
    const initializer = dashboard.slice(dashboard.indexOf("const toInitialValues"), dashboard.indexOf("function DeleteModal"));
    const toInitialValues = new Function(`${initializer}; return toInitialValues;`)();
    assert.equal(toInitialValues({ variant: [{ stock: 17 }] }).variants[0].stock, "17");
});

test("unpaid checkout attempts cannot be fulfilled or restore stock", async () => {
    for (const paymentStatus of ["pending", "failed"]) {
        let writes = 0;
        const handler = handlers({
            Payment: { findOne: () => query({ _id: paymentId, paymentStatus, items: [item] }) },
            Order: { findOneAndUpdate: async () => { writes++; return { status: "pending", statusHistory: [], save: async () => {} }; } },
            Product: { find: () => query([product]), updateOne: async () => { writes++; } },
        });
        const res = response();
        await handler.updateOrderStatus(request({ status: "cancelled" }), res);
        assert.equal(res.code, 400);
        assert.equal(writes, 0);
    }
});

test("concurrent cancellations restore inventory only once", async () => {
    let status = "pending";
    let restored = 0;
    const handler = handlers({
        Payment: { findOne: () => query({ _id: paymentId, paymentStatus: "completed", items: [item] }) },
        Order: { findOneAndUpdate: async (filter, update) => {
            if (update.$setOnInsert) return { _id: paymentId, status, statusHistory: [], save: async () => {} };
            if (filter.status !== status) return null;
            status = update.$set.status;
            return { _id: paymentId, status };
        } },
        Product: { find: () => query([product]), updateOne: async () => { restored++; } },
    });
    const results = [response(), response()];
    await Promise.all(results.map((res) => handler.updateOrderStatus(request({ status: "cancelled" }), res)));
    assert.equal(restored, 1);
    assert.deepEqual(results.map((res) => res.code).sort(), [200, 409]);
});

test("concurrent refund decisions restore inventory only once", async () => {
    let status = "approved";
    let restored = 0;
    const returned = { _id: paymentId, productId, variantId, quantity: 2, save: async () => {} };
    const handler = handlers({
        ReturnRequest: {
            findOne: async () => ({ ...returned, status }),
            findOneAndUpdate: async (filter, update) => {
                if (filter.status !== status) return null;
                status = update.$set.status;
                return { ...returned, status };
            },
        },
        Product: { updateOne: async () => { restored++; } },
    });
    const results = [response(), response()];
    await Promise.all(results.map((res) => handler.decideReturn(request({ status: "refunded" }), res)));
    assert.equal(restored, 1);
    assert.deepEqual(results.map((res) => res.code).sort(), [200, 409]);
});

test("seller order detail exposes the buyer under the UI contract", async () => {
    const buyer = { fullname: "Buyer", addresses: [{ line1: "Delivery address" }] };
    const handler = handlers({
        Payment: { findOne: () => query({ _id: paymentId, user: buyer, items: [item] }) },
        Order: { findOne: () => query(null) },
    });
    const res = response();
    await handler.getSellerOrder(request(), res);
    assert.deepEqual(res.body.data.buyer, buyer);
    assert.equal(res.body.data.units, 2);
});

test("low-rating attention query is scoped to seller products", async () => {
    let reviewQuery;
    const handler = handlers({
        Payment: { countDocuments: async () => 0 },
        ReturnRequest: { countDocuments: async () => 0 },
        Review: { countDocuments: async (filter) => { reviewQuery = filter; return 0; } },
    });
    const res = response();
    await handler.getAttentionFeed(request(), res);
    assert.equal(res.code, 200);
    assert.deepEqual(reviewQuery.product, { $in: [productId] });
});

test("restocking invalidates catalog and product detail caches", async () => {
    let deleted = [];
    const handler = handlers({
        Product: { updateOne: async () => ({ modifiedCount: 1 }) },
        del: async (...keys) => { deleted = keys; },
    });
    const res = response();
    await handler.restockVariant(request({ productId, variantId, quantity: 3 }), res);
    assert.equal(res.code, 200);
    assert.deepEqual(deleted, ["products:all:v1", `product:id:${productId}:v1`]);
});

test("settlement payable deducts coupon share before fees", async () => {
    const handler = handlers({
        Payment: { aggregate: async () => [{ _id: { year: 2026, week: 39 }, gross: 200, discounts: 40, units: 2, orders: [paymentId], latest: new Date() }] },
    });
    const res = response();
    await handler.getSellerSettlements(request(), res);
    assert.equal(res.code, 200);
    assert.equal(res.body.data[0].payable, 150.4);
});
