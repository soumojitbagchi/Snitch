import { config } from "../config/config.js";

export const exchangeRate = async (c1,c2)=>{
    if (c1 === c2) return 1;

    const response = await fetch(config.RATE_EXCHANGE+`/${c1}/${c2}`);
    if(!response.ok){
        throw new Error(`currency exchange api failed to convert : ${response.status}` )
    }
    const data = await response.json()
    const currentRate = Number(data.rate);
    if (!Number.isFinite(currentRate) || currentRate <= 0) {
        throw new Error("currency exchange api returned an invalid rate");
    }

    return currentRate
}
