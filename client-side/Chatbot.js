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
        const htmlContent = data.choices[0].message.content;

        // Insert HTML content into the response element
        responseElement.innerHTML = htmlContent;
        console.log(htmlContent);

        // Extract and execute any script elements
        const scripts = responseElement.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.innerHTML = script.innerHTML;
            }
            document.body.appendChild(newScript);
        }
    } catch (error) {
        responseElement.innerHTML = 'Error: ' + error.message;
    } finally {
        loadingElement.style.display = "none"; // Hide loading indicator
    }
});
