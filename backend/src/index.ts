import express from "express";
import cors from "cors";
import {
  publicRateLimiter,
  userRateLimiter,
} from "./limiters/requestLimiter.js";
import { PORT } from "./configs/config.js";
import type { Application, Request, Response, RequestHandler } from "express";
import publicRouter from "./routes/public.js";
import userRouter from "./routes/users.js";

const app: Application = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }) as RequestHandler);
app.use(
  express.urlencoded({ extended: true, limit: "100kb" }) as RequestHandler,
);

app.use("/api/v1/public", publicRateLimiter as RequestHandler);
app.use("/api/v1/users", userRateLimiter as RequestHandler);

app.use("/api/v1/public", publicRouter as RequestHandler);
app.use("/api/v1/users", userRouter as RequestHandler);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
