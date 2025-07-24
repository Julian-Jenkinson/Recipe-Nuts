import * as FileSystem from 'expo-file-system';

export async function downloadAndStoreImage(remoteUrl: string): Promise<string> {
  try {
    console.log("downloadAndStoreImage: starting for URL", remoteUrl);

    const filename =
      remoteUrl.split("/").pop()?.split("?")[0] || `image_${Date.now()}.jpg`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    console.log("downloadAndStoreImage: will save to", fileUri);

    const result = await FileSystem.downloadAsync(remoteUrl, fileUri);

    console.log("downloadAndStoreImage: downloadAsync result", result);

    return result.uri; // should be file://...
  } catch (error) {
    console.error("downloadAndStoreImage: error", error);
    // fallback to empty string, never null
    return "";
  }
}
