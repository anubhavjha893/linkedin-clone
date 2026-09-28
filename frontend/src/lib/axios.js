import axios from "axios";

const PROD_API_ORIGIN = import.meta.env.VITE_API_URL || "";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : `${PROD_API_ORIGIN}/api/v1`,
	withCredentials: true,
});
