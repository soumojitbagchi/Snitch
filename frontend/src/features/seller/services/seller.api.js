import { createApiClient } from '../../auth/services/api.client'

const api = createApiClient('/api/seller')
const productApi = createApiClient('/api/product')

const pageParams = (page, limit, extra = {}) => ({
    params: { page, limit, ...extra },
});

export const fetchSellerOrders = async (page = 1, limit = 20, status = "") => {
    const response = await api.get('/orders', pageParams(page, limit, status ? { status } : {}));
    return response.data;
}

export const fetchSellerOrder = async (paymentId) => {
    const response = await api.get(`/orders/${paymentId}`);
    return response.data;
}

export const updateSellerOrderStatus = async (paymentId, status, reason = "") => {
    const response = await api.patch(`/orders/${paymentId}/status`, { status, reason });
    return response.data;
}

export const fetchSellerStats = async (days = 30) => {
    const response = await api.get('/stats', { params: { days } });
    return response.data;
}

export const fetchSellerSettlements = async () => {
    const response = await api.get('/settlements');
    return response.data;
}

export const fetchAttentionFeed = async () => {
    const response = await api.get('/attention');
    return response.data;
}

export const fetchLowStock = async (threshold = 5) => {
    const response = await api.get('/inventory/low-stock', { params: { threshold } });
    return response.data;
}

export const fetchVariantVelocity = async () => {
    const response = await api.get('/inventory/velocity');
    return response.data;
}

export const restockVariant = async ({ productId, variantId, quantity }) => {
    const response = await api.post('/inventory/restock', { productId, variantId, quantity });
    return response.data;
}

export const sendStockAlert = async () => {
    const response = await api.post('/inventory/alert');
    return response.data;
}

export const fetchSellerCoupons = async () => {
    const response = await api.get('/coupons');
    return response.data;
}

export const createSellerCoupon = async (values) => {
    const response = await api.post('/coupons', values);
    return response.data;
}

export const deleteSellerCoupon = async (code) => {
    const response = await api.delete(`/coupons/${encodeURIComponent(code)}`);
    return response.data;
}

export const updateVariant = async (productId, { variantIndex = 0, stock, size, color }) => {
    const response = await productApi.put(`/update-variant/${productId}`, { variantIndex, stock, size, color });
    return response.data;
}

export const bulkDeleteProducts = async (ids) => {
    const response = await productApi.post('/bulk-delete', { ids });
    return response.data;
}

export const toggleProductSale = async (productId, onSale) => {
    const response = await productApi.put(`/sale/${productId}`, { onSale });
    return response.data;
}
