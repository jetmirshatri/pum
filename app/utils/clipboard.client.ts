export const copyToClipboard = async (text: string): Promise<void> => {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable');
  }
  await navigator.clipboard.writeText(text);
};
