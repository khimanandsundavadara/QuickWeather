import apiClient from "./apiClient";

export const weatherSerrvice = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAll : async (city:string):Promise<any>=>{
        const res = await apiClient.get(`/weather?q=${city}&appid=b7fdc340ad482e716a9448bec6e2fb7e&units=metric`);
        return res.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getForcast : async (city:string):Promise<any>=>{
        const res = await apiClient.get(`/forecast?q=${city}&appid=b7fdc340ad482e716a9448bec6e2fb7e&units=metric`)
        return res.data
    }
}