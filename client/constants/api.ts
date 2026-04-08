import axios from "axios"


const PROD_API_URL = "https://ecommerce-app-eight-virid.vercel.app/api"

const api =axios.create({baseURL:PROD_API_URL})

export default api;//Here this instance of the api call the different Network request