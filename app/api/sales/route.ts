import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { items, total, amountPaid } = await request.json();
    
    const change = amountPaid - total;
    
    const { data, error } = await supabase
      .from('sales')
      .insert([
        {
          items,
          total,
          amount_paid: amountPaid,
          change
        }
      ])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      saleId: data.id 
    });

  } catch (error) {
    console.error('Error al procesar la venta:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la venta' },
      { status: 500 }
    );
  }
} 