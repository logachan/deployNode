
import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
const app = express();

let pool;

// Create connection pool
async function initDB() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            // ssl: { rejectUnauthorized: true },
        });


        console.log(":PPPool", pool);
        

        // Test the connection
        const connection = await pool.getConnection();
        console.log("✅ Database connected successfully!");
        connection.release();
    } catch (err) {
        
        console.error("❌ Database connection failed:", err.message);
        process.exit(1); // Stop server if DB not reachable
    }
}


initDB()


// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("🚀 Node.js API with MySQL is running!");
});

// Example: Get users
app.get("/users", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json({
            message: "Students retrieved Successfully!",
            data: rows
        });
    } catch (err) {
        console.error(err);
        res.json({
            message: "Error DB Service",
            status: 500
        });
    }
});

// Example: Insert user
app.post("/users/add", async (req, res) => {
    try {
        const { name, email } = req.body;
        const userAdd = await pool.query("INSERT INTO users (name, email) VALUES (?, ?)", [
            name,
            email,
        ]);
        res.json({
            message: "User added Succesfully",
            data: userAdd
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Insert error");
    }
});

app.patch('/users/edit/:id', async (req, res) => {
    try {
        const { name, email } = req?.body

        const {id} = req?.params

        const checkID = await pool.query(`select * from users where id= ?`,[id])
        
        
        if(!checkID){
            res.json({
                message:"NO ID FOUND"
            })
        }
        

        // Update query
        const [result] = await pool.query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("User not found");
        }

        res.json({
            message:"User Updated Successfully",
            data:result
        })

    } catch (error) {

    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
