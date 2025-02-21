var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/c_cpp");

let executionSteps = [];
let currentStep = 0;

function parseCode() {
    let code = editor.getValue();
    executionSteps = [];

    let lines = code.split("\n");

    let callStack = [];
    let variables = {};
    let outputLog = "";

    lines.forEach((line, index) => {
        let trimmedLine = line.trim();

        if (trimmedLine.includes("cout <<")) {
            let match = trimmedLine.match(/cout << "(.*?)"/);
            if (match) {
                outputLog += match[1] + "\n";
                executionSteps.push({ type: "output", output: outputLog, line: index });
            }
        }

        if (trimmedLine.includes("for") || trimmedLine.includes("while")) {
            executionSteps.push({ type: "loop", info: "Loop detected", line: index });
        }

        if (trimmedLine.match(/void\s+\w+\(\)/)) {
            let functionName = trimmedLine.match(/void\s+(\w+)\(\)/)[1];
            executionSteps.push({ type: "function", functionName, action: "Declared", line: index });
        }

        if (trimmedLine.match(/\w+\(\);/)) {
            let functionName = trimmedLine.match(/(\w+)\(\);/)[1];
            callStack.push(functionName);
            executionSteps.push({ type: "call", functionName, action: "Called", stack: [...callStack], line: index });
        }

        if (trimmedLine.includes("return")) {
            callStack.pop();
            executionSteps.push({ type: "return", functionName: callStack[callStack.length - 1] || "main", stack: [...callStack], line: index });
        }
    });

    updateVisualization();
}

function updateVisualization() {
    let outputContainer = document.getElementById("output-container");
    outputContainer.innerHTML = "";

    if (executionSteps[currentStep]) {
        let stepData = executionSteps[currentStep];

        if (stepData.type === "output") {
            outputContainer.innerText = stepData.output;
        } else if (stepData.type === "loop") {
            outputContainer.innerText = "Loop Execution";
        } else if (stepData.type === "function") {
            outputContainer.innerText = `Function ${stepData.functionName} Declared`;
        } else if (stepData.type === "call") {
            outputContainer.innerText = `Function ${stepData.functionName} Called\nStack: ${stepData.stack.join(" -> ")}`;
        } else if (stepData.type === "return") {
            outputContainer.innerText = `Returning from function ${stepData.functionName}\nStack: ${stepData.stack.join(" -> ")}`;
        }

        highlightCurrentLine(stepData.line);
    }
}

function highlightCurrentLine(line) {
    editor.session.removeMarker(currentStep);
    let range = new ace.Range(line, 0, line, 100);
    currentStep = editor.session.addMarker(range, "highlighted-line", "fullLine");
}

function nextStep() {
    if (currentStep < executionSteps.length - 1) {
        currentStep++;
        updateVisualization();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateVisualization();
    }
}

function reset() {
    currentStep = 0;
    updateVisualization();
}

editor.session.on("change", function() {
    parseCode();
});

parseCode();
