import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/message/user");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messagedata) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messagedata);
            set({ messages: [...messages, res.data] })
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Remove any existing listeners first to prevent duplicates
        socket.off("newMessage");

        // Add the new listener
        socket.on("newMessage", (newMessage) => {
            const { selectedUser: currentSelectedUser } = get();
            
            console.log("Received new message:", newMessage);
            console.log("Current selected user:", currentSelectedUser?._id);
            console.log("Message sender:", newMessage.senderId);
            
            // Only add message if it's from the currently selected user
            if (newMessage.senderId === currentSelectedUser?._id) {
                set({
                    messages: [...get().messages, newMessage],
                });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    },

    setSelectedUser: (selectedUser) => {
        // Unsubscribe from previous user's messages
        get().unsubscribeFromMessages();
        
        set({ selectedUser });
        
        // Subscribe to new user's messages immediately (no timeout needed)
        if (selectedUser) {
            get().subscribeToMessages();
        }
    },
}))