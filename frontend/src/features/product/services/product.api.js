import axios from 'axios'

const api = axios.create({
    baseURL: '/api/product',
    withCredentials: true,
})

export const fetchAllProducts = async (signal) => {
    const response = await api.get('/all', { signal });
    return response.data;
}

export const fetchMyProducts = async (signal) => {
    const response = await api.get('/all-by-seller', { signal });
    return response.data;
}

export const createProduct = async ({ title, description, priceAmount, priceCurrency, size, color, stockAmount, images }) => {
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    if (priceAmount != null) form.append('priceAmount', String(priceAmount));
    if (priceCurrency) form.append('priceCurrency', priceCurrency);
    if (size) form.append('size', size);
    if (color) form.append('color', color);
    if (stockAmount != null) form.append('stockAmount', String(stockAmount));
    (images ?? []).forEach((image) => form.append('images', image));
    const response = await api.post('/create', form);
    return response.data;
}

export const editTitle = async (productId, title) => {
    const response = await api.put(`/update-title/${productId}`, { title });
    return response.data;
}

export const editDescription = async (productId, description) => {
    const response = await api.put(`/update-description/${productId}`, { description });
    return response.data;
}

export const editPrice = async (productId, priceAmount, variantIndex = 0) => {
    const response = await api.put(`/update-price/${productId}`, { priceAmount, variantIndex });
    return response.data;
}

export const updateProductImage = async (productId, images) => {
    const form = new FormData();
    (Array.isArray(images) ? images : [images]).forEach((image) => form.append('images', image));
    const response = await api.put(`/update-image/${productId}`, form);
    return response.data;
}

export const deleteProduct = async (productId) => {
    const response = await api.delete(`/${productId}`);
    return response.data;
}
