import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import path from "path";

import { connectDB } from "./lib/db.js";
import cors from "cors"
import { app,server } from "./lib/socket.js";


dotenv.config();


const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json()); //extract the data out of json body
app.use(cookieParser());  //used to parse the cookie
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}));

app.use("/api/auth" , authRoutes);
app.use("/api/message" , messageRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    
    app.get("/*" , (req,res) =>{
        res.sendFile(path.join(__dirname, "../frontend" ,"dist" , "index.html"));
    })
}

server.listen(PORT , ()=>{
    console.log(`server is listening at http://localhost:${PORT}`)
    connectDB();

})