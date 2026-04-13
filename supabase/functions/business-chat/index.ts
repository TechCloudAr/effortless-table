import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, restaurantId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let contextData = "";

    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, currency")
        .eq("id", restaurantId)
        .maybeSingle();

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data: orders } = await supabase
        .from("orders")
        .select("total, items, status, created_at")
        .eq("restaurant_id", restaurantId)
        .in("status", ["received", "preparing", "ready", "delivered"])
        .gte("created_at", since.toISOString());

      if (orders && orders.length > 0) {
        const totalVentas = orders.reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0);
        const ticketPromedio = totalVentas / orders.length;
        const ventasDiarias = totalVentas / 30;

        const productCount: Record<string, number> = {};
        for (const order of orders) {
          const items = Array.isArray(order.items) ? order.items : [];
          for (const item of items as Array<{ name?: string; quantity?: number }>) {
            const name = item.name || "Desconocido";
            productCount[name] = (productCount[name] || 0) + (item.quantity || 1);
          }
        }
        const topProductos = Object.entries(productCount)
          .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => name + " (" + qty + " vendidos)")
          .join(", ");

        const currency = restaurant && restaurant.currency ? restaurant.currency : "$";
        const nombreResto = restaurant && restaurant.name ? restaurant.name : "Tu restaurante";

        contextData = "\nDatos reales del restaurante (ultimos 30 dias):\n" +
          "- Nombre: " + nombreResto + "\n" +
          "- Pedidos completados: " + orders.length + "\n" +
          "- Ventas totales: " + currency + Math.round(totalVentas) + "\n" +
          "- Ventas promedio diarias: " + currency + Math.round(ventasDiarias) + "\n" +
          "- Ticket promedio: " + currency + Math.round(ticketPromedio) + "\n" +
          "- Productos mas vendidos: " + (topProductos || "Sin datos suficientes");
      } else {
        contextData = "\n- Sin pedidos registrados todavia. El sistema esta en etapa inicial.\n- Anima al dueno a cargar el menu y activar el primer QR.";
      }
    } else {
      contextData = "\n- No se proporciono restaurantId. Responde de forma general sobre gestion de restaurantes.";
    }

    const systemPrompt = "Eres un asistente de negocios especializado en restaurantes. Ayudas a los duenos a entender sus metricas, optimizar ventas, reducir costos y tomar decisiones basadas en datos.\n" + contextData + "\n\nResponde siempre en espanol, de forma concisa y accionable. Usa datos concretos cuando sea posible.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes, intenta en unos momentos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Creditos agotados. Agrega fondos en Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e: unknown) {
    console.error("business-chat error:", e);
    const message = e instanceof Error ? e.message : "Error desconocido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
