document.addEventListener("DOMContentLoaded", async () => {
    const questionContainer = document.getElementById("questions");
    const responseForm = document.getElementById("responseForm");
    const matchButton = document.getElementById("matchButton");
    const matchResult = document.getElementById("matchResult");

    // Fetch questions from backend
    const res = await fetch("/api/questions");
    const questions = await res.json();

    questions.forEach(q => {
        const div = document.createElement("div");
        div.innerHTML = `<label>${q.text}: 
            <select name="q${q.id}">
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>
        </label>`;
        questionContainer.appendChild(div);
    });

    responseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(responseForm);
        const role = formData.get("role");
        formData.delete("role");

        const responses = Object.fromEntries(formData.entries());

        await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, responses })
        });

        alert("Response submitted successfully!");
        responseForm.reset();
    });

    matchButton.addEventListener("click", async () => {
        const res = await fetch("/api/match-mentee");
        const data = await res.json();
        matchResult.innerHTML = JSON.stringify(data, null, 2);
    });
});
