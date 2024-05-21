document.getElementById("chatbotForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let input = document.getElementById("chatbotInput").value;
    let responseElement = document.getElementById("response");
    let loadingElement = document.getElementById("loading");

    responseElement.innerHTML = "";
    loadingElement.style.display = "block"; // Show loading indicator

    try {
        const response = await fetch('http://localhost:3000/api/chatCompletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: input })
        });

        const data = await response.json();
        responseElement.innerHTML = data.choices[0].message.content;
    } catch (error) {
        responseElement.innerHTML = 'Error: ' + error.message;
    } finally {
        loadingElement.style.display = "none"; // Hide loading indicator
    }
});
