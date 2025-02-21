const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ✅ Default Route
app.get("/", (req, res) => {
    res.send("Welcome to the C++ Visualizer Backend!");
});

// ✅ C++ Code Execution
app.post("/execute", (req, res) => {
    console.log("Request received at /execute");

    if (!req.body.code) {
        return res.status(400).json({ error: "No code provided" });
    }

    const userCode = req.body.code;
    const fileName = "temp.cpp";
    const outputFile = process.platform === "win32" ? "temp.exe" : "temp.out";

    // Save C++ code to a file
    fs.writeFile(fileName, userCode, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to write file", details: err.message });
        }

        // Compile the C++ code
        exec(`g++ -g ${fileName} -o ${outputFile}`, (compileError, _, compileStderr) => {
            if (compileError) {
                console.error("Compilation Error:", compileStderr);
                return res.status(400).json({ error: "Compilation failed", details: compileStderr });
            }

            console.log("Compilation Successful!");

            // Execute the compiled file
            exec(outputFile, (runError, runStdout, runStderr) => {
                if (runError) {
                    console.error("Execution Error:", runStderr);
                    return res.status(400).json({ error: "Execution failed", details: runStderr });
                }

                console.log("Execution Output:", runStdout);
                res.json({ output: runStdout });
            });
        });
    });
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
