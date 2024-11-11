document.addEventListener('DOMContentLoaded', function() {
  const NUMPLAYERS = 25;
  let UNSETNUMBERS = 0;
  let REMOVALOT;
  const UNSETNUM = Array(10).fill(0);
  const playerInfo = {};
  let isLoading = false;

  const playerButtonsDiv = document.getElementById('playerButtons');
  const fileInput = document.getElementById('fileInput');
  fileInput.style.display = 'none'; // Hide file input initially

  function goToPage(page) {
    window.location.href = page;
  }

  // Function to load players from CSV content
  function loadPlayersFromCSV(csvContent) {
    playerButtonsDiv.innerHTML = '';
    const rows = csvContent.split('\n');

    rows.forEach((row, index) => {
      const [playerName, division] = row.split(',');
      if (index === 0 && playerName.toLowerCase().includes('name')) return;
      if (!playerName.trim()) return;

      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player-div');
      playerDiv.onclick = () => togglePlayerNumber(playerName, playerDiv);
      playerDiv.innerText = `${playerName}`;
      playerDiv.id = `player-${playerName.replace(/\s+/g, '-')}`;
      playerButtonsDiv.appendChild(playerDiv);

      playerInfo[playerName] = { number: null, division: division.trim() };
    });
  }

  // Function to check for the presence of `playerslist.csv`
  function checkForDefaultCSV() {
    fetch('/playerslist.csv')
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('Default CSV file not found');
        }
      })
      .then(csvContent => {
        console.log('Default CSV file found, loading players...');
        loadPlayersFromCSV(csvContent);
      })
      .catch(error => {
        console.log(error.message);
        alert('Default CSV file not found. Please upload a CSV file.');
        fileInput.style.display = 'block'; // Show file input for user upload
      });
  }

  // File upload handler for manual CSV file upload
  function handleFileUpload() {
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Please upload a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      console.log("Loading players from uploaded file...");
      loadPlayersFromCSV(event.target.result);
    };
    reader.readAsText(fileInput.files[0]);
  }

  fileInput.addEventListener('change', handleFileUpload);

  // Function to toggle player number
  function togglePlayerNumber(playerName, playerDiv) {
    console.log(`Toggling number for ${playerName}`);
    const existingBubble = playerDiv.querySelector('.player-number');
    if (existingBubble) playerDiv.removeChild(existingBubble);

    if (playerInfo[playerName].number === null) {
      if (UNSETNUMBERS === 0) {
        const numberToAssign = Object.values(playerInfo).filter(info => info.number).length + 1;
        if (numberToAssign <= NUMPLAYERS) {
          playerInfo[playerName].number = numberToAssign;
          createNumberBubble(playerDiv, numberToAssign);
        } else {
          alert("All numbers are already allocated.");
        }
      } else {
        const UNUM = UNSETNUMBERS;
        playerInfo[playerName].number = UNSETNUM[UNUM];
        UNSETNUM[UNUM] = 0;
        UNSETNUMBERS--;
        createNumberBubble(playerDiv, playerInfo[playerName].number);
      }
    } else {
      REMOVALOT = playerInfo[playerName].number;
      playerInfo[playerName].number = null;
      UNSETNUMBERS++;
      UNSETNUM[UNSETNUMBERS] = REMOVALOT;
    }
    console.log(`Player ${playerName} number is now ${playerInfo[playerName].number}`);
  }

  // Function to create a number bubble for players
  function createNumberBubble(playerDiv, number) {
    const numberBubble = document.createElement('div');
    numberBubble.classList.add('player-number');
    numberBubble.innerText = number;
    playerDiv.appendChild(numberBubble);
  }

  // Function to reset players
  function resetPlayers() {
    console.log("Resetting players...");
    playerButtonsDiv.innerHTML = '';
    Object.keys(playerInfo).forEach(playerName => {
      playerInfo[playerName].number = null;
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player-div');
      playerDiv.onclick = () => togglePlayerNumber(playerName, playerDiv);
      playerDiv.innerText = `${playerName} - ${playerInfo[playerName].division}`;
      playerDiv.id = `player-${playerName.replace(/\s+/g, '-')}`;
      playerButtonsDiv.appendChild(playerDiv);
    });

    UNSETNUMBERS = 0;
    UNSETNUM.fill(0);
    console.log("Players reset complete");
  }

  // Function to confirm player allocation
  function confirmAllocation() {
    try {
      const playersWithNumbers = Object.keys(playerInfo)
        .filter(player => playerInfo[player].number !== null)
        .map(player => ({
          number: playerInfo[player].number,
          name: player,
          division: playerInfo[player].division
        }));

      // Check if exactly 25 players are selected
      if (playersWithNumbers.length !== 25) {
        alert("25 players are not selected. Please select exactly 25 players.");
        return; // Exit the function without proceeding to page13
      }

      // Sort the array by player number
      playersWithNumbers.sort((a, b) => a.number - b.number);

      // Store the sorted data in sessionStorage
      sessionStorage.setItem('sortedPlayers', JSON.stringify(playersWithNumbers));

      alert("Player selections confirmed. Redirecting to reordering page.");
      goToPage('page13.html');
    } catch (error) {
      console.error("Error confirming player selections:", error);
      alert("There was an error confirming player selections. Please try again.");
    }
  }

  // Initialize by checking for the default CSV
  checkForDefaultCSV();
});
