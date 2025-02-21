const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/execute", (req, res) => {
    const { code } = req.body;
    fs.writeFileSync("temp.cpp", code);

    exec("g++ temp.cpp -o temp.out && ./temp.out", (error, stdout, stderr) => {
        if (error) {
            res.json({ output: stderr });
        } else {
            res.json({ output: stdout });
        }
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));
