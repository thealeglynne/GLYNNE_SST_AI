export async function GET(req) {
    try {
      const { table } = req.nextUrl.searchParams;
  
      if (!table) {
        return new Response(JSON.stringify({ error: "Falta el nombre de la tabla" }), { status: 400 });
      }
  
      const { data: rows, error } = await supabaseAdmin.from(table).select("*");
  
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
  
      return new Response(JSON.stringify({ rows }), { status: 200 });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }