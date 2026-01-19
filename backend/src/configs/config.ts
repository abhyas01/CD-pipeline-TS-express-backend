import dotenv from "dotenv";

dotenv.config();

const PORT: string | undefined = process.env.PORT;

export { PORT };
