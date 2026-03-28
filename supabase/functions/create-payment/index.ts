import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
    }

    const { orderId, items, total, tableNumber, backUrl, currencyId = 'MXN' } = await req.json();

    if (!orderId || !items || !total || !tableNumber || !backUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build MercadoPago preference
    const preference = {
      items: items.map((item: any) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: Number(item.unitPrice),
      })),
      back_urls: {
        success: `${backUrl}/pago/exito?order=${orderId}`,
        failure: `${backUrl}/pago/error?order=${orderId}`,
        pending: `${backUrl}/pago/pendiente?order=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: undefined, // webhook for production
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('MercadoPago error:', mpData);
      throw new Error(`MercadoPago API error [${mpResponse.status}]: ${JSON.stringify(mpData)}`);
    }

    // Update order with preference ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from('orders')
      .update({ mercadopago_preference_id: mpData.id })
      .eq('id', orderId);

    return new Response(JSON.stringify({
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
