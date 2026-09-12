import axios from 'axios'

const api = axios.create({
    baseURL: '/api/product',
    withCredentials: true,
})


export const createProduct = async (fields, media) => {
    const { title, description, priceAmount, priceCurrency } = fields ?? {};
    const form = new FormData();
    if (title != null) form.append('title', title);
    if (description != null) form.append('description', description);
    if (priceAmount != null) form.append('priceAmount', String(priceAmount));
    if (priceCurrency != null) form.append('priceCurrency', priceCurrency);
    Array.from(media ?? []).forEach((file) => {
        form.append('images', file);
    });
    const response = await api.post('/create', form);
    return response.data;
}
export const editTitle = async ({productId, title}) => {
    const response = await api.put(`/edit-title/${productId}`, { title });
    return response.data;
}
export const editDescription = async (productId, description) => {
    const response = await api.put(`/edit-description/${productId}`, { description });
    return response.data;
}
export const editPrice = async (productId, price) => {
    const response = await api.put(`/edit-price/${productId}`, { price });
    return response.data;
}
export const updateProductImage = async (productId, image) => {
    const response = await api.put(`/update-image/${productId}`, { image });
    return response.data;
}


