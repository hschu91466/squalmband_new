import axios from 'axios';

const instance = axios.create({
  baseURL: "", // uses same origin
  withCredentials: true,
}); 

export default instance;