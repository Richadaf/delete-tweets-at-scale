# Twitter Bulk Deleter

Twitter Bulk Deleter is a Chrome Extension designed to help users delete tweets in bulk by simulating user interactions with the Twitter interface. This tool is particularly useful for those looking to manage their Twitter presence efficiently.


# How to use

It takes in an input json like so..
```json
  {
        "url": "https://twitter.com/username/status/tweetid",
        "text": "It is attractive when the vocals are naturally silky in texture.",
        "created_at": "2023-04-22 14:45:22"
    }
```
and deletes it. You have to be logged in and have permissions to delete the tweet.

## Features

- Deletes tweets in bulk by automating user clicks.
- Simulates deletion while adhering to Twitter’s UI structure.
- Customizable to handle confirmation dialogs and additional steps if necessary.

## Folder Structure

```
.
├── background
│   └── background.js      # Service worker script for handling actions.
├── content
│   └── contentScript.js   # Script injected into Twitter to automate deletion.
├── popup
│   ├── popup.html         # HTML for the extension’s popup UI.
│   └── popup.js           # JavaScript for popup interaction.
├── images                 # Icons and visuals for the extension.
├── manifest.json          # Chrome extension configuration file.
└── README.md              # Documentation for the codebase.
```

## Installation

1. Clone or download the repository:

   ```bash
   git clone https://github.com/richadaf/twitter-bulk-deleter.git
   ```

2. Navigate to the `twitter-bulk-deleter` directory and compress the folder into a ZIP file (if required by your browser).

3. Open your Chrome browser and navigate to: `chrome://extensions/`

4. Enable **Developer mode** (toggle in the top-right corner).

5. Click **Load unpacked** and select the folder containing the extension files.

6. The extension should now appear in your Chrome Extensions list.

## Usage

1. Log in to Twitter/X and navigate to your profile or tweets page.

2. Click the Twitter Bulk Deleter extension icon in the Chrome toolbar.

3. In the popup UI, configure the deletion options (e.g., auto-confirm dialogs).

4. Click "Start Deletion" to begin deleting tweets. The extension will simulate the process automatically.

## Key Components

### `background/background.js`

This service worker listens for actions triggered via the extension UI and coordinates the deletion process:

- Opens tweet URLs in new tabs.
- Injects the `contentScript.js` into those tabs.

### `content/contentScript.js`

This script is responsible for:

- Identifying the "Delete" button on the tweet menu.
- Simulating clicks to delete the tweet.
- Handling confirmation dialogs if required.

### `manifest.json`

Defines the permissions, host permissions, and configuration for the extension. Key settings include:

- **Host Permissions**: `*://twitter.com/*`, `*://x.com/*`.
- **Permissions**: `tabs`, `storage`, `scripting`, `activeTab`.

## Error Handling

- **Issue**: `Delete menu item not found`.

  - Solution: Ensure the selector in `contentScript.js` matches the current Twitter/X UI.

- **Issue**: `TypeError: deleteMenuItem.click is not a function`.

  - Solution: Use `document.querySelectorAll` to get a NodeList and access individual elements with `[0]`.

## Customization

### Updating Selectors

If Twitter/X changes their UI, selectors in `contentScript.js` may need to be updated:

1. Inspect the page using Chrome Developer Tools.
2. Locate the updated element and note its attributes.
3. Modify the selectors in `contentScript.js` accordingly.

Example:

```javascript
const deleteMenuItem = document.querySelectorAll('NEW_SELECTOR_HERE');
```

### Adding Features

1. Open the relevant script (e.g., `contentScript.js` or `background.js`).
2. Add your feature logic and ensure it aligns with the current workflow.
3. Test thoroughly before deploying.

## Known Limitations

- UI-dependent: Changes to Twitter/X’s interface may require updates to the selectors.
- Rate Limits: Excessive usage may trigger Twitter’s rate-limiting mechanisms.
- JSON input: You need to download your data from twitter and create a json containing tweet id and text to the extension

## Contributions


Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For questions or support, feel free to reach out:

- Email: [richardfamoroti@gmail.com](mailto\:richardfamoroti@gmail.com)
- GitHub Issues: [Issues Page](https://github.com/richadaf/bulk-tweet-delete/issues)

