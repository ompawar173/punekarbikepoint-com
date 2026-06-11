// One-shot admin credential rotation. Uses service role; not exposed to client UI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const NEW_EMAIL = "punekarbikepoint01@gmail.com";
    const NEW_PASSWORD = "admin@123";

    // Find existing admin
    const { data: roles, error: rErr } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1);
    if (rErr) throw rErr;

    let userId: string | null = roles?.[0]?.user_id ?? null;

    if (userId) {
      // Update existing admin's email + password
      const { error: uErr } = await admin.auth.admin.updateUserById(userId, {
        email: NEW_EMAIL,
        password: NEW_PASSWORD,
        email_confirm: true,
      });
      if (uErr) throw uErr;
    } else {
      // Create new admin
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: NEW_EMAIL,
        password: NEW_PASSWORD,
        email_confirm: true,
      });
      if (cErr) throw cErr;
      userId = created.user!.id;
      const { error: roleErr } = await admin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (roleErr) throw roleErr;
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId, email: NEW_EMAIL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: e?.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
