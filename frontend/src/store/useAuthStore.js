import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// calling the create function which accept a callback function where we return an object

export const useAuthStore = create((set,get) => ({
  authUser: null, //because we don't know whether the user is authenticated or not, we might have a loading state for this
  isSigningUp: false,
  isLoggingUp: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,
  onlineUsers: [],
  socket : null,

  // this function basically checks whether the user is authenticated or not when user refresh the page and we set a loading state for that fraction of time
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();

    } catch (error) {
      console.log("Error in checkAuth :", error);

      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      
      get().connectSocket();

    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingUp: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      localStorage.removeItem("token");
      set({ authUser: null });
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile :", error);
      toast.error(error.response.data.message);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      set({ isUpdatingProfile: false });
    }
  },


  connectSocket : () => {
    const {authUser} = get()
    if(!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL , {
      query : {
        userId : authUser._id,

      },
    })
    socket.connect();

    set({socket : socket});

    socket.on("getOnlineUsers" , (userIds) =>{
      set({onlineUsers : userIds})
    })
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
  
}));

// Zustand is like a global store + state updater combined:

// It creates a global store using the create() function.

// Any React component can use this store through a simple hook (e.g., useAuthStore).

// There's no provider or context wrapper needed because Zustand internally manages the state outside React's component tree.
