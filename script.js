function goToPage(page) {
  window.location.href = page;
}
// Initialize required variables
const NUMPLAYERS = 25;
let UNSETNUMBERS = 0;
let REMOVALOT;
const UNSETNUM = Array(10).fill(0);
const playerInfo = {};
let isLoading = false;

function goToPage(page) {
  window.location.href = page;
}

function loadPlayers() {
  if (isLoading) {
    console.log("Already loading, please wait.");
    return;
  }
  
  isLoading = true;
  console.log("Loading players...");
  
  const fileInput = document.getElementById('fileInput');
  const playerButtonsDiv = document.getElementById('playerButtons');

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please upload a CSV file.');
    isLoading = false;
    return;
  }

  playerButtonsDiv.innerHTML = '';
  Object.keys(playerInfo).forEach(key => delete playerInfo[key]);

  const reader = new FileReader();
  reader.onload = function(event) {
    const rows = event.target.result.split('\n');
    console.log(`Loaded ${rows.length} rows from CSV`);
    
    let playerCount = 0;
    rows.forEach((row, index) => {
      const [playerName, division] = row.split(',');

      if (index === 0 && playerName.toLowerCase().includes('name')) return;
      if (!playerName.trim()) return;

      playerCount++;
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player-div');
      playerDiv.onclick = () => togglePlayerNumber(playerName, playerDiv);
      playerDiv.innerText = `${playerName} - ${division.trim()}`;
      playerDiv.id = `player-${playerName.replace(/\s+/g, '-')}`;
      playerButtonsDiv.appendChild(playerDiv);

      playerInfo[playerName] = { number: null, division: division.trim() };
    });

    console.log(`Added ${playerCount} players to the display`);
    isLoading = false;
  };

  reader.readAsText(fileInput.files[0]);
}

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

function createNumberBubble(playerDiv, number) {
  const numberBubble = document.createElement('div');
  numberBubble.classList.add('player-number');
  numberBubble.innerText = number;
  playerDiv.appendChild(numberBubble);
}

function resetPlayers() {
  console.log("Resetting players...");
  const playerButtonsDiv = document.getElementById('playerButtons');
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
    window.location.href = 'page13.html';
  } catch (error) {
    console.error("Error confirming player selections:", error);
    alert("There was an error confirming player selections. Please try again.");
  }
}