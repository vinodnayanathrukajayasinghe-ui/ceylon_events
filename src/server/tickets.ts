import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface IssueTicketsInput {
  orderId: string;
}

interface IssueTicketsResult {
  createdCount: number;
  issuedCount: number;
  quantity: number;
  orderReference: string;
  message: string;
}

function parseIssueInput(input: IssueTicketsInput) {
  const orderId = input?.orderId?.trim();

  if (!orderId) {
    throw new Error("Missing order ID.");
  }

  return { orderId };
}

export const issueTicketsForOrderServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseIssueInput)
  .handler(async ({ data, context }): Promise<IssueTicketsResult> => {
    const userEmail =
      typeof context.claims.email === "string" ? context.claims.email.toLowerCase() : "";

    const [{ data: order, error: orderError }, { data: roleRows, error: roleError }] =
      await Promise.all([
        supabaseAdmin.from("ticket_orders").select("*").eq("id", data.orderId).maybeSingle(),
        supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId),
      ]);

    if (orderError) {
      console.error("issueTicketsForOrderServer: load order failed", orderError);
      throw new Error(`Unable to load the ticket order. ${orderError.message}`);
    }

    if (roleError) {
      console.error("issueTicketsForOrderServer: load roles failed", roleError);
      throw new Error(`Unable to verify account access. ${roleError.message}`);
    }

    if (!order) {
      throw new Error("Ticket order not found.");
    }

    const isAdmin = !!roleRows?.some((row) => row.role === "admin");
    const ownsOrder =
      order.user_id === context.userId ||
      (!!userEmail && userEmail === String(order.customer_email || "").toLowerCase());

    if (!isAdmin && !ownsOrder) {
      throw new Error("You do not have permission to issue tickets for this order.");
    }

    if (order.payment_status !== "paid") {
      throw new Error("This order is not marked as paid yet.");
    }

    const { count: existingIssuedCount, error: existingIssuedError } = await (supabaseAdmin as any)
      .from("issued_tickets")
      .select("id", { count: "exact", head: true })
      .eq("order_id", data.orderId);

    if (existingIssuedError) {
      console.error("issueTicketsForOrderServer: count issued tickets failed", existingIssuedError);
      throw new Error(`Unable to inspect issued tickets. ${existingIssuedError.message}`);
    }

    let createdCount = 0;

    if ((existingIssuedCount || 0) < order.quantity) {
      const { data: rpcData, error: rpcError } = await (supabaseAdmin as any).rpc(
        "sync_order_payment_to_tickets",
        { _order_id: data.orderId },
      );

      if (rpcError) {
        console.error("issueTicketsForOrderServer: sync_order_payment_to_tickets failed", {
          orderId: data.orderId,
          orderReference: order.order_reference,
          rpcError,
        });
        throw new Error(`Ticket issuance failed at the database layer. ${rpcError.message}`);
      }

      createdCount = Number(rpcData || 0);
    }

    const { count: finalIssuedCount, error: finalIssuedError } = await (supabaseAdmin as any)
      .from("issued_tickets")
      .select("id", { count: "exact", head: true })
      .eq("order_id", data.orderId);

    if (finalIssuedError) {
      console.error("issueTicketsForOrderServer: final count failed", finalIssuedError);
      throw new Error(`Ticket issuance succeeded, but verification failed. ${finalIssuedError.message}`);
    }

    if ((finalIssuedCount || 0) < order.quantity) {
      throw new Error(
        `Only ${finalIssuedCount || 0} of ${order.quantity} tickets are currently issued for order ${order.order_reference}.`,
      );
    }

    return {
      createdCount,
      issuedCount: finalIssuedCount || 0,
      quantity: order.quantity,
      orderReference: order.order_reference,
      message:
        createdCount > 0
          ? "Issued tickets generated successfully."
          : "Issued tickets are already available for this order.",
    };
  });
