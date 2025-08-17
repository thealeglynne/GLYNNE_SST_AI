import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export async function POST(req) {
  try {
    const { tableName, columns } = await req.json();

    if (!tableName || !columns?.length) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
    }

    const columnDefs = columns.map(c => `${c.name} ${c.type}`).join(", ");
    const primaryKeys = columns.filter(c => c.isPrimary).map(c => c.name);
    const pkDef = primaryKeys.length ? `, PRIMARY KEY (${primaryKeys.join(", ")})` : "";

    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs}${pkDef});`;

    const { error } = await supabaseAdmin.rpc("exec_sql", { sql });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ success: true, tableName }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
