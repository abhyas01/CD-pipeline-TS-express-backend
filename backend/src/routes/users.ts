import express from "express";
import type { Request, Response, Router } from "express";
import { pool } from "../db/pool.js";

const userRouter: Router = express.Router();

userRouter.get("/todos", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, is_done, created_at FROM todos ORDER BY id DESC",
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /todos failed:", err);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

userRouter.post("/todos", async (req: Request, res: Response) => {
  try {
    const title = String(req.body?.title ?? "").trim();
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO todos (title) VALUES (?)",
      [title],
    );

    res.status(201).json({
      id: (result as any).insertId,
      title,
      is_done: false,
    });
  } catch (err) {
    console.error("POST /todos failed:", err);
    res.status(500).json({ message: "Failed to create todo" });
  }
});

userRouter.delete("/todos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "invalid id" });
    }

    const [result] = await pool.execute("DELETE FROM todos WHERE id = ?", [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: "todo not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /todos failed:", err);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

export default userRouter;
