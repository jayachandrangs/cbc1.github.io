document.addEventListener('DOMContentLoaded', function() {
    const playerList = document.getElementById('playerList');
    let sortedPlayers = JSON.parse(sessionStorage.getItem('sortedPlayers')) || [];

    // Initialize variables
    let ROTATENUM = 0; // To track the free number index
    const FREENUM = Array(15).fill(0); // Array to hold free numbers

    function createPlayerRow(player) {
        const row = document.createElement('div');
        row.className = 'player-row';
        
        const playerNameDiv = document.createElement('div');
        playerNameDiv.className = 'player-name';
        playerNameDiv.innerText = `${player.name}`; // Only show player name
        
        const numberDiv = document.createElement('div');
        numberDiv.className = 'player-number';
        numberDiv.innerText = player.number !== null ? player.number : '';

        // Click event to toggle number allocation
        playerNameDiv.onclick = () => togglePlayerNumber(player);

        row.appendChild(playerNameDiv);
        row.appendChild(numberDiv);
        
        return row;
    }

    function renderPlayers() {
        // Sort players by their assigned numbers in ascending order
        sortedPlayers.sort((a, b) => (a.number || Infinity) - (b.number || Infinity));
        
        playerList.innerHTML = '';
        sortedPlayers.forEach(player => {
            playerList.appendChild(createPlayerRow(player));
        });
    }

    function togglePlayerNumber(player) {
        const currentNumber = player.number;

        if (currentNumber !== null) {
            // Remove the number from the player
            ROTATENUM++;
            FREENUM[ROTATENUM - 1] = currentNumber; // Store removed number in FREENUM
            player.number = null; // Set player's number to null
        } else if (ROTATENUM > 0) {
            // Assign a free number to the player
            const freeNumber = FREENUM[ROTATENUM - 1];
            player.number = freeNumber; // Assign the free number to the player
            FREENUM[ROTATENUM - 1] = 0; // Reset the free number slot
            ROTATENUM--; // Decrease ROTATENUM
        }

        // Update sessionStorage with new player data
        sessionStorage.setItem('sortedPlayers', JSON.stringify(sortedPlayers));
        
        // Re-render players to reflect changes
        renderPlayers();
    }

    function exportToCSV() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + sortedPlayers.map(player => `"${player.name},${player.division}",`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "players.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "players.csv"
    }

    renderPlayers();

    // Action button functionalities
    document.getElementById('backButton').addEventListener('click', () => {
      window.location.href = 'page12.html';
    });

    document.getElementById('refreshButton').addEventListener('click', () => {
      sortedPlayers = JSON.parse(sessionStorage.getItem('sortedPlayers')) || [];
      renderPlayers(); // Refresh the display with current data from sessionStorage
      alert("Screen refreshed with current data.");
    });

    document.getElementById('allotCourtMixedButton').addEventListener('click', () => {
      exportToCSV(); // Export players to CSV when this button is clicked
    });

    document.getElementById('allotCourtSimpleButton').addEventListener('click', () => {
      alert("Allot Court Simple action selected."); 
      renderPlayers(); // Refresh display for now
    });
});