import axios from "axios";

export const api = axios.create({
  baseURL: `/api`,
  url: process.env.NEXTAUTH_URL,
});
