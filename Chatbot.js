document.getElementById("chatbotForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let input = document.getElementById("chatbotInput").value;

    try {
        const response = await fetch('http://localhost:3000/api/chatCompletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: input })
        });

        const data = await response.json();
        document.getElementById("response").innerHTML = data.choices[0].message.content;
    } catch (error) {
        console.log('Error: ', error)
    }
});