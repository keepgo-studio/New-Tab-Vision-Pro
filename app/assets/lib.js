export async function getRecentHistory(n) {
  return await chrome.history.search({ text: '', maxResults: n })
}