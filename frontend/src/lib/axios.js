import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api", // base URL for all requests
    withCredentials: true, // send cookies automatically with requests
})