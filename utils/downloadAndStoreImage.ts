import * as FileSystem from 'expo-file-system';

export async function downloadAndStoreImage(url: string): Promise<string | null> {
  try {
    const fileName = url.split('/').pop() || `image_${Date.now()}.jpg`;

    if (!FileSystem.documentDirectory) {
      console.warn('No document directory available');
      return null;
    }

    const fileUri = FileSystem.documentDirectory + fileName;

    // Avoid re-downloading if file already exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    const { uri } = await FileSystem.downloadAsync(url, fileUri);
    return uri;
  } catch (error) {
    console.error('Image download failed:', error);
    return null;
  }
}
