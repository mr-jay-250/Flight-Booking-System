import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  try {
    // Check admin authorization
    const { admin, error: authError } = await requireAdmin(req);
    if (authError || !admin) {
      return NextResponse.json({ error: authError || "Not authorized as admin" }, { status: 401 });
    }

    // Fetch all airlines
    const { data: airlines, error } = await supabaseAdmin
      .from('airlines')
      .select('id, code, name, logo_url, country')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching airlines:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ airlines: airlines || [] });

  } catch (error: any) {
    console.error('Admin airlines API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 