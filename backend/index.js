import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {connectDB} from "./db/connectDB.js"; //Database connection

//Routes
import postRoutes from "./routes/post.routes.js";
import userAuthRoutes from "./routes/user.routes.js";

// const PORT = process.env.PORT || 3000;
const PORT = 3000;
const app = express();
// expressBusboy.extend(app);
//Middlewares
dotenv.config({
  path: "./.env",
});

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

//Cors Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
// app.use(cors(corsOptions));
// app.use(cors());

app.use((req, res, next) => {
  if (req.path !== "/favicon.ico") {
    console.log(req.method, req.path);
  }
  next();
});

app.use("/api/v1/auth", userAuthRoutes);
app.use("/api/v1/post", postRoutes);

app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
  connectDB();
});
