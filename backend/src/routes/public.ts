import express from "express";
import type { Request, Response, Router } from "express";

const publicRouter: Router = express.Router();

publicRouter.post("/signup", (req: Request, res: Response) => {
  res.status(200).json({ message: "/signup endpoint." });
});

export default publicRouter;
