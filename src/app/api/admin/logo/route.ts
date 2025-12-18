import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Disable Edge runtime
// This is necessary for file system operations
export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    let config = await prisma.logoConfiguration.findFirst();
    
    if (!config) {
      // Create default config if none exists
      config = await prisma.logoConfiguration.create({
        data: {}
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching logo configuration:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const lightLogo = formData.get('lightLogo') as File | null;
    const darkLogo = formData.get('darkLogo') as File | null;
    
    if (!lightLogo && !darkLogo) {
      return new NextResponse('No files provided', { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Get or create config
    let config = await prisma.logoConfiguration.findFirst();
    if (!config) {
      config = await prisma.logoConfiguration.create({
        data: {}
      });
    }

    const updateData: { lightLogoPath?: string; darkLogoPath?: string } = {};
    const uploadPromises = [];

    // Process light logo
    if (lightLogo && lightLogo.size > 0) {
      const bytes = await lightLogo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const sanitizedFilename = lightLogo.name.replace(/[^\w\d.-]/g, '_');
      const filename = `light-${Date.now()}-${sanitizedFilename}`;
      const path = join(uploadsDir, filename);
      
      uploadPromises.push(
        writeFile(path, buffer).then(() => {
          updateData.lightLogoPath = `/uploads/logos/${filename}`;
        })
      );
    }

    // Process dark logo
    if (darkLogo && darkLogo.size > 0) {
      const bytes = await darkLogo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const sanitizedFilename = darkLogo.name.replace(/[^\w\d.-]/g, '_');
      const filename = `dark-${Date.now()}-${sanitizedFilename}`;
      const path = join(uploadsDir, filename);
      
      uploadPromises.push(
        writeFile(path, buffer).then(() => {
          updateData.darkLogoPath = `/uploads/logos/${filename}`;
        })
      );
    }

    // Wait for all file uploads to complete
    await Promise.all(uploadPromises);

    // Only update if we have something to update
    if (Object.keys(updateData).length > 0) {
      const updatedConfig = await prisma.logoConfiguration.update({
        where: { id: config.id },
        data: updateData,
      });
      return NextResponse.json(updatedConfig);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in logo upload API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process logo upload', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
