import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config.js'
import testRoutes from "./routes/testRoutes.js"
import attemptRoutes from "./routes/attemptRoutes.js"
import answerRoutes from "./routes/answerRoutes.js"



//config
const app = express()
const port = 4000

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use(cors({
  origin: ["http://localhost:5173", "https://online-exam-frontend-snowy.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


//db connection
connectDB();

app.use("/api/user", userRouter)
app.use("/api/tests", testRoutes)
app.use("/api/attempt", attemptRoutes)
app.use("/api/answers", answerRoutes)




app.get("/", (req, res) => {
  res.send("API Working")
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
