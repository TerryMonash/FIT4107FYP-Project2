document.getElementById("chatbotForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let input = document.getElementById("chatbotInput").value;
    const responseElement = document.getElementById("response");
    responseElement.innerHTML = "Processing...";

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
        showActionButtons();
    } catch (error) {
        console.log('Error: ', error)
        responseElement.innerHTML = "Error processing your request.";
    }
});

function showActionButtons() {
    document.getElementById("action-buttons").style.display = "block";
}

function hideActionButtons() {
    document.getElementById("action-buttons").style.display = "none";
}

// Add listeners for the new buttons
document.getElementById("revertChanges").addEventListener("click", function() {
    // Define the revert functionality
    revertChanges();
    hideActionButtons();
});

document.getElementById("confirmChanges").addEventListener("click", function() {
    // Define what happens when changes are confirmed
    confirmChanges();
    hideActionButtons();
});

function revertChanges() {
    document.getElementById("response").innerHTML = "";
}

function confirmChanges() {
    alert("Changes confirmed!");
}