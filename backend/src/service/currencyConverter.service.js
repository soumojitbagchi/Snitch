import { config } from "../config/config.js";

export const exchangeRate = async (c1,c2)=>{
    const response = await fetch(config.RATE_EXCHANGE+`/${c1}/${c2}`);
    if(!response.ok){
        throw new Error(`currency exchange api failed to convert : ${response.status}` )
    }
    const data = await response.json()
    const currentRate = (data.rate)

    return currentRate
}
