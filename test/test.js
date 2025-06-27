// Example usage:
// import { SimpleFramework } from "../index.js";
import { SimpleFramework } from "simple_framework_js";

const app = new SimpleFramework();

const PORT = 5000;

// Configure database
app.database({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "testdb",
});

// GET route
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

// GET route with parameters
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const users = await req.query("SELECT * FROM users WHERE id = ?", [userId]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST route
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await req.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );
    res.json({ id: result.insertId, name, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
