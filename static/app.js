function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function showLoading(outputElement) {
    outputElement.innerHTML = `
        <div class="loading active">
            <div class="spinner"></div>
            <p>🤖 AI is analyzing your code...</p>
        </div>
    `;
}

function showError(outputElement, message) {
    outputElement.innerHTML = `<div class="error-message"><strong>❌ Error:</strong> ${message}</div>`;
}

async function explainCode() {
    await handleCode("explain", "explanationOutput", "explanation");
}

async function debugCode() {
    await handleCode("debug", "debugOutput", "debug");
}

async function handleCode(task, outputId, tabName) {
    const codeInput = document.getElementById('codeInput').value.trim();
    const language = document.getElementById('language').value;
    const outputElement = document.getElementById(outputId);

    if (!codeInput) {
        showError(outputElement, "Please enter some code.");
        return;
    }

    switchTab(tabName);
    showLoading(outputElement);

    try {
        const response = await fetch("http://127.0.0.1:8000/process/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeInput, task: task, language: language })
        });

        const data = await response.json();
        outputElement.innerHTML = `
            <div class="success-message">
                ✅ ${task === "debug" ? "Debug" : "Explanation"} Complete
            </div>
            <div style="margin-top: 20px; white-space: pre-wrap;">
                ${data.response}
            </div>
        `;
    } catch (error) {
        showError(outputElement, "Something went wrong. Please try again.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('language').addEventListener('change', function () {
        const examples = {
            javascript: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));`,
            python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
        };
        const codeInput = document.getElementById('codeInput');
        if (examples[this.value] && !codeInput.value.trim()) {
            codeInput.placeholder = examples[this.value];
        }
    });
});
