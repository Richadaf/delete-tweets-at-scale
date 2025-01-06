
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'DELETE_TWEET') {
    const { tweetId, autoConfirmAll } = request;
    try {
      await simulateDeletion(autoConfirmAll);
      sendResponse({ status: 'success', tweetId });
    } catch (error) {
      console.error('Error in contentScript deleting tweet:', error);
      sendResponse({ status: 'error', tweetId, error: error.toString() });
    }
  }
});

async function simulateDeletion(autoConfirmAll) {
  // 1. Click the "hamburger" or "caret" menu
  const menuButton = document.querySelector('#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-kemksi.r-1kqtdi0.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > section > div > div > div:nth-child(1) > div > div > article > div > div > div.css-175oi2r.r-18u37iz > div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci > div > div > div.css-175oi2r.r-1kkk96v > div > div > div > div > button');
  if (!menuButton) throw new Error('Menu button not found.');

  menuButton.click();
  await waitFor(1500);

  // 2. Find the "Delete" menu item
  const deleteMenuItems = document.querySelectorAll('#layers > div.css-175oi2r.r-zchlnj.r-1d2f490.r-u8s1d.r-ipm5af.r-1p0dtai.r-105ug2t > div > div > div > div.css-175oi2r.r-1ny4l3l > div > div.css-175oi2r.r-j2cz3j.r-kemksi.r-1q9bdsx.r-qo02w8.r-1udh08x.r-u8s1d > div > div > div > div:nth-child(1) > div.css-175oi2r.r-16y2uox.r-1wbh5a2 > div > span');

  console.log(deleteMenuItems);
  
  // Check if at least one menu item is found
  if (!deleteMenuItems || deleteMenuItems.length === 0) {
      throw new Error('Delete menu item not found.');
  }
  
  // Assuming you want to click the first matching item
  const deleteMenuItem = deleteMenuItems[0];
  deleteMenuItem.click();
  
  await waitFor(1000);

  // 3. Confirm deletion (second "Delete" button)
  const confirmDeleteButton = [...document.querySelectorAll('#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-1kihuf0.r-xr3zp9.r-1awozwy.r-1pjcn9w.r-9dcw1g > div.css-175oi2r.r-kemksi.r-pm9dpa.r-1rnoaur.r-1867qdf.r-z6ln5t.r-494qqr.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div.css-175oi2r.r-eqz5dr.r-1hc659g.r-7lkd7n.r-11c0sde.r-13qz1uu > button:nth-child(1)')]
    .find(el => el.innerText.toLowerCase().includes('delete'));
  if (!confirmDeleteButton) throw new Error('Confirm delete button not found.');

  // Auto-confirm or just click it
  confirmDeleteButton.click();
  await waitFor(1000);
}


// Utility: Wait for some milliseconds
function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
