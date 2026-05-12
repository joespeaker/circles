import "express-async-errors";
import { app } from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
