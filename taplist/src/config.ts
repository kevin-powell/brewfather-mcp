// Site-wide settings for the tap list. Edit freely.
export const site = {
  name: "On Tap",
  tagline: "What's pouring right now, straight from the brew log.",
  // Brewfather's API returns colour as a number; set which scale it's in.
  // Run `npm run inspect` and compare a known beer against the Brewfather app if unsure.
  colorUnit: "srm" as "srm" | "ebc",
  // Show the batch number on each card
  showBatchNumber: true,
};
