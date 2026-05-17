import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { CreateOrderSchema } from "@/lib/validations/api-schemas";
import { z } from "zod";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});


export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = CreateOrderSchema.parse(json);
    const amount = body.amount ?? 99900;
    const currency = body.currency ?? "INR";
    const receipt = body.receipt;

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: true,
    } as any);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create order", details: err.message },
      { status: 500 }
    );
  }
}



