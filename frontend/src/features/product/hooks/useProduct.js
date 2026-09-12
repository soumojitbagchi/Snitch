import { useDispatch, useSelector } from "react-redux";
import {
    loading as setLoadingAction,
    error as setErrorAction,
    success as setSuccessAction,
    submitting as setSubmittingAction,
    setProducts,
    selectProducts,
    selectProductLoading,
    selectProductSubmitting,
    selectProductError,
    selectProductSuccess,
} from "../../redux/product.slice";
import { createProduct as createProductApi } from "../services/product.api";

// Create-only hook: wires ProductForm state to the createProduct API
// using the existing product slice state (loading/error/success/submitting).
export const useProduct = () => {
    const dispatch = useDispatch();
    const products = useSelector(selectProducts);
    const loading = useSelector(selectProductLoading);
    const submitting = useSelector(selectProductSubmitting);
    const error = useSelector(selectProductError);
    const success = useSelector(selectProductSuccess);

    const createProductHandler = async (fields, media) => {
        dispatch(setSubmittingAction(true));
        dispatch(setLoadingAction(true));
        dispatch(setErrorAction(null));
        dispatch(setSuccessAction(null));
        try {
            const data = await createProductApi(fields, media);
            const created = data?.product ?? data?.data ?? data;
            if (data?.success === false) {
                throw new Error(data?.message || "Failed to create product.");
            }
            if (created && created._id) {
                dispatch(setProducts([...(products ?? []), created]));
            }
            dispatch(setSuccessAction(data?.message || "Product created successfully."));
            return { ok: true, product: created, raw: data };
        } catch (err) {
            const message =
                err?.response?.data?.message || err?.message || "Failed to create product.";
            dispatch(setErrorAction(message));
            return { ok: false, error: message };
        } finally {
            dispatch(setSubmittingAction(false));
            dispatch(setLoadingAction(false));
        }
    };

    return {
        products,
        loading,
        submitting,
        error,
        success,
        createProductHandler,
    };
};

export default useProduct;
