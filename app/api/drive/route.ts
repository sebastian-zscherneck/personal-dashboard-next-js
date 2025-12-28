import { NextRequest, NextResponse } from "next/server";
import {
  listDriveFiles,
  listRecentDriveFiles,
  uploadToDrive,
  deleteDriveFile,
} from "@/lib/google";

// Force dynamic rendering - ensures env vars are read at runtime
export const dynamic = "force-dynamic";

function getDefaultFolderId() {
  return process.env.GOOGLE_DRIVE_FOLDER_ID;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recent = searchParams.get("recent") === "true";
    const folderId = searchParams.get("folderId");

    // If recent=true, show recently modified files across all Drive
    if (recent) {
      const files = await listRecentDriveFiles(20);
      return NextResponse.json(files);
    }

    // Otherwise show files in specific folder (or default folder)
    const targetFolder = folderId || getDefaultFolderId();
    const files = await listDriveFiles(targetFolder || undefined);

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error listing drive files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = (formData.get("folderId") as string) || getDefaultFolderId();

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedFile = await uploadToDrive(
      file.name,
      file.type,
      buffer,
      folderId || undefined
    );

    return NextResponse.json(uploadedFile, { status: 201 });
  } catch (error) {
    console.error("Error uploading to drive:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    await deleteDriveFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
