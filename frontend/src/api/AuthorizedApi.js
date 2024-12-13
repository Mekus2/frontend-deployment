import axios from "axios";

export const createAuthorizedInstance = () => {
  const token = localStorage.getItem("access_tokenStorage"); // Retrieve the access token

  return axios.create({
    baseURL: "https://backend-deployment-production-92b6.up.railway.app", // Your API base URL
    headers: {
      Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
      "Content-Type": "application/json",
    },
  });
};
