/* eslint-disable */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side client using ENV vars
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { files, projectId, slug } = await req.json();

    if (!projectId || !slug || !files) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ error: "Slug must contain only lowercase letters, numbers, and hyphens" }, { status: 400 });
    }

    // Check if slug is used by ANY other project
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .neq("id", projectId)
      .single();
    
    if (existing) {
      return NextResponse.json({ error: "This slug is already taken. Please choose another one." }, { status: 409 });
    }

    // Update project with slug and published files
    console.log(`[API Deploy] Updating project ${projectId} with slug ${slug}`);
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("projects")
      .update({ 
        slug: slug.trim().toLowerCase(), 
        published_files: files,
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId)
      .select();

    if (updateError) {
      console.error("[API Deploy] Update error:", updateError);
      throw updateError;
    }

    if (!updateData || updateData.length === 0) {
      console.error("[API Deploy] No rows updated. Does the projectId exist?");
      return NextResponse.json({ error: "Project not found or you don't have permission to update it." }, { status: 404 });
    }

    console.log("[API Deploy] Update successful");

    // Determine host URL for deployment link
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}/s/${slug}`;

    return NextResponse.json({ 
      success: true,
      url, 
      slug 
    });
  } catch (error: any) {
    console.error("Deploy API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
