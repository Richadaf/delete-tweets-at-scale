
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'START_DELETION') {
    const { tweets, autoConfirmAll } = request;
    await deleteTweetsSequentially(tweets, autoConfirmAll);
  }
});

// Helper: open a tab for each tweet, inject script, close tab, proceed.
async function deleteTweetsSequentially(tweets, autoConfirmAll) {
  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    const tweetId = parseTweetId(tweet.url);

    // Update UI about progress
    sendProgress(`Deleting tweet \${i + 1} of \${tweets.length} (ID: \${tweetId})...`);

    try {
      // 1. Create a new tab
      const tab = await chrome.tabs.create({ url: tweet.url, active: false });

      // 2. Wait a moment for the page to load
      await delay(3000);

      // 3. Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/contentScript.js']
      });

      // 4. Send a message to content script to delete the tweet
      await chrome.tabs.sendMessage(tab.id, {
        action: 'DELETE_TWEET',
        tweetId,
        autoConfirmAll
      });

      // 5. Wait a bit for the deletion to complete
      await delay(7 * 1000);

      // 6. Close the tab
      await chrome.tabs.remove(tab.id);
    } catch (error) {
      console.error(`Error deleting tweet ${tweetId}:`, error);
      // Log issue, continue to next
    }

    // Small delay to avoid hitting rate limits or suspicious activity
    await delay(2000);
  }

  sendProgress('Finished deleting tweets.');
}

function sendProgress(text) {
  chrome.runtime.sendMessage({ action: 'DELETION_PROGRESS', text });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseTweetId(url) {
  try {
    const parts = url.split('/');
    return parts[parts.length - 1];
  } catch (e) {
    return null;
  }
}
