// We'll keep our tweets array in memory but also sync to storage
let tweets = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const loadBtn = document.getElementById('loadBtn');
  const jsonFileInput = document.getElementById('jsonFile');
  const tweetsTableBody = document.querySelector('#tweetsTable tbody');
  const selectAllCheckbox = document.getElementById('selectAll'); // Added for "Select All"
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  const progressDiv = document.getElementById('progress');
  const autoConfirmAllCheckbox = document.getElementById('autoConfirmAll');

  let selectedIndexes = [];

  // ======================
  // Initial load from storage
  // ======================
  loadStateFromStorage().then(() => {
    // After loading state, rebuild the table with the data
    rebuildTableUI();
  });

  // ======================
  // Build or rebuild table
  // ======================
  function rebuildTableUI() {
    tweetsTableBody.innerHTML = '';

    tweets.forEach((tweet, index) => {
      const row = document.createElement('tr');

      // "Select" checkbox
      const selectTd = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.index = index;

      // Check if this index is in the selectedIndexes array
      if (selectedIndexes.includes(index)) {
        checkbox.checked = true;
      }

      // Update selectedIndexes and storage when checkbox is toggled
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          if (!selectedIndexes.includes(index)) {
            selectedIndexes.push(index);
          }
        } else {
          selectedIndexes = selectedIndexes.filter(i => i !== index);
        }
        saveSelectionsToStorage();

        // Update "Select All" checkbox state
        updateSelectAllCheckboxState();
      });

      selectTd.appendChild(checkbox);

      // Tweet ID (parsed from URL)
      const tweetId = parseTweetId(tweet.url);
      const idTd = document.createElement('td');
      idTd.textContent = tweetId;

      // Tweet text
      const textTd = document.createElement('td');
      textTd.textContent = tweet.text || '(No text)';

      row.appendChild(selectTd);
      row.appendChild(idTd);
      row.appendChild(textTd);

      tweetsTableBody.appendChild(row);
    });

    // Update "Select All" checkbox state after building the table
    updateSelectAllCheckboxState();
  }

  // Update the state of the "Select All" checkbox
  function updateSelectAllCheckboxState() {
    const checkboxes = document.querySelectorAll('#tweetsTable tbody input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = !allChecked && anyChecked;
  }

  // ======================
  // Add "Select All" feature
  // ======================
  selectAllCheckbox.addEventListener('change', () => {
    const isChecked = selectAllCheckbox.checked;
    const checkboxes = document.querySelectorAll('#tweetsTable tbody input[type="checkbox"]');

    selectedIndexes = [];

    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = isChecked; // Set checkbox state
      if (isChecked) {
        selectedIndexes.push(index); // Add all indexes if "Select All" is checked
      }
    });

    // Save the updated selections to storage
    saveSelectionsToStorage();
  });

  // ======================
  // Event listeners for buttons
  // ======================

  // Load the JSON file
  loadBtn.addEventListener('click', async () => {
    const file = jsonFileInput.files[0];
    if (!file) {
      alert('Please select a JSON file first.');
      return;
    }

    try {
      const text = await file.text();
      tweets = JSON.parse(text);

      // Reset selectedIndexes when a new file is loaded
      selectedIndexes = [];

      // Rebuild the table
      rebuildTableUI();

      // Save tweets to storage
      saveStateToStorage();

      progressDiv.textContent = `Loaded ${tweets.length} tweets.`;
    } catch (err) {
      console.error('Error loading tweets:', err);
      alert('Failed to parse the JSON file. Check console for details.');
    }
  });

  // Delete Selected
  deleteSelectedBtn.addEventListener('click', async () => {
    const selectedIndexArr = [];
    document
      .querySelectorAll('#tweetsTable tbody input[type="checkbox"]')
      .forEach((checkbox) => {
        if (checkbox.checked) {
          selectedIndexArr.push(parseInt(checkbox.dataset.index, 10));
        }
      });

    if (selectedIndexArr.length === 0) {
      alert('No tweets selected.');
      return;
    }

    const toDelete = selectedIndexArr.map((idx) => tweets[idx]);
    startDeletion(toDelete, autoConfirmAllCheckbox.checked);
  });

  // Delete All
  deleteAllBtn.addEventListener('click', async () => {
    if (!tweets || tweets.length === 0) {
      alert('No tweets loaded.');
      return;
    }
    startDeletion(tweets, autoConfirmAllCheckbox.checked);
  });

  // Auto-confirm checkbox changes
  autoConfirmAllCheckbox.addEventListener('change', () => {
    saveStateToStorage();
  });

  // Listen for progress from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'DELETION_PROGRESS') {
      progressDiv.textContent = message.text;
    }
  });

  // ======================
  // Additional Helpers
  // ======================

  // Save tweets + autoConfirmAll + selectedIndexes
  function saveStateToStorage() {
    chrome.storage.local.set({
      tweets,
      selectedIndexes,
      autoConfirmAll: autoConfirmAllCheckbox.checked
    }, () => {
      console.log('State saved to storage.');
    });
  }

  function parseTweetId(url) {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return null;
    }
  }

  function startDeletion(tweetList, autoConfirmAll) {
    progressDiv.textContent = 'Starting deletion process...';
    chrome.runtime.sendMessage({
      action: 'START_DELETION',
      tweets: tweetList,
      autoConfirmAll
    });
  }
});

  // Save current tweets and checkbox state to chrome.storage.local
  function saveStateToStorage() {
    chrome.storage.local.set({
      tweets,
      autoConfirmAll: autoConfirmAllCheckbox.checked
    }, () => {
      // Optional: Could log or do something after saving
      console.log('State saved to storage.');
    });
  }

  // Load state from storage, set our local tweets array and checkbox
  function loadStateFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tweets', 'autoConfirmAll'], (result) => {
        if (result.tweets) {
          tweets = result.tweets;
        }
        if (typeof result.autoConfirmAll === 'boolean') {
          autoConfirmAllCheckbox.checked = result.autoConfirmAll;
        }
        resolve();
      });
    });
  }