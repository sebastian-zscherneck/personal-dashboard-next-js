import { google, sheets_v4, drive_v3 } from "googleapis";
import { Readable } from "stream";

// Service Account Authentication
function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error("Google service account credentials not configured");
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

// Sheets Client
let sheetsClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: "v4", auth: getAuthClient() });
  }
  return sheetsClient;
}

// Drive Client
let driveClient: drive_v3.Drive | null = null;

export function getDriveClient(): drive_v3.Drive {
  if (!driveClient) {
    driveClient = google.drive({ version: "v3", auth: getAuthClient() });
  }
  return driveClient;
}

// Sheets Helpers
export async function readSheet(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return (response.data.values as string[][]) || [];
}

export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

export async function updateSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function clearSheet(
  spreadsheetId: string,
  range: string
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
}

// Drive Helpers
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  parents?: string[];
}

export async function listDriveFiles(
  folderId?: string,
  pageSize: number = 50
): Promise<DriveFile[]> {
  const drive = getDriveClient();

  // Sanitize folderId to prevent query injection (only allow alphanumeric and hyphens)
  const sanitizedFolderId = folderId?.replace(/[^a-zA-Z0-9_-]/g, "");
  const query = sanitizedFolderId
    ? `'${sanitizedFolderId}' in parents and trashed = false`
    : "trashed = false";

  const response = await drive.files.list({
    q: query,
    pageSize,
    fields:
      "files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, parents)",
    orderBy: "modifiedTime desc",
  });

  return (response.data.files as DriveFile[]) || [];
}

export async function listRecentDriveFiles(
  pageSize: number = 20
): Promise<DriveFile[]> {
  const drive = getDriveClient();

  const response = await drive.files.list({
    q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
    pageSize,
    fields:
      "files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, parents)",
    orderBy: "modifiedTime desc",
  });

  return (response.data.files as DriveFile[]) || [];
}

export async function uploadToDrive(
  fileName: string,
  mimeType: string,
  content: Buffer | string,
  folderId?: string
): Promise<DriveFile> {
  const drive = getDriveClient();

  const fileMetadata: drive_v3.Schema$File = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType,
    body: Readable.from([content]),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, mimeType, webViewLink",
  });

  return response.data as DriveFile;
}

export async function createDriveFolder(
  name: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const drive = getDriveClient();

  const fileMetadata: drive_v3.Schema$File = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentFolderId ? [parentFolderId] : undefined,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id, name, mimeType, webViewLink",
  });

  return response.data as DriveFile;
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

export async function getDriveFile(fileId: string): Promise<DriveFile> {
  const drive = getDriveClient();
  const response = await drive.files.get({
    fileId,
    fields:
      "id, name, mimeType, createdTime, modifiedTime, size, webViewLink, parents",
  });
  return response.data as DriveFile;
}

/**
 * Upload file to Drive using stored refresh token (automatic, no sign-in required)
 * Uses GOOGLE_REFRESH_TOKEN from environment to get fresh access tokens.
 */
export async function uploadToUserDrive(
  fileName: string,
  mimeType: string,
  content: Buffer | string,
  folderId?: string
): Promise<DriveFile> {
  // Import dynamically to avoid circular dependencies
  const { getAccessToken } = await import("@/lib/google-oauth");
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const fileMetadata: drive_v3.Schema$File = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType,
    body: Readable.from([content]),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, mimeType, webViewLink",
  });

  return response.data as DriveFile;
}
