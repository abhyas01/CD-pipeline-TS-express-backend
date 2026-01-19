import express from "express";
import type { Request, Response, Router } from "express";

const userRouter: Router = express.Router();

userRouter.get("/get-todos", (req: Request, res: Response) => {
  res.status(200).json({ message: "get-todo endpoint." });
});

export default userRouter;
