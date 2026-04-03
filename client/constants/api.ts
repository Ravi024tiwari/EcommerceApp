import axios from "axios"
import { Platform } from "react-native"

const LOCAL_API_URL =Platform.select({
    android:"http://10.151.63.244:3000/api",//this is the IP address of our frontEnd devices
    ios:"http://10.151.63.244:3000/api",//this is ip address of where our frontend is
    default:"http://localhost:3000/api"
})

const api =axios.create({baseURL:LOCAL_API_URL})

export default api;//Here this instance of the api call the different Network request