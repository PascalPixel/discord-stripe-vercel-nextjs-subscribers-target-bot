import pLimit from "p-limit";
import Stripe from "stripe";

// Concurrency limiter
const limit = pLimit(50);

// Stripe API setup
export function getStripe(options?: { stripeKey?: string }) {
  return new Stripe(options?.stripeKey || process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });
}

export async function fetchSubscriptions(options?: {
  stripeKey?: string;
}): Promise<Stripe.Subscription[]> {
  console.debug("Fetching subscriptions from Stripe");
  const stripe = getStripe({ stripeKey: options?.stripeKey });
  const subscriptions: Stripe.Subscription[] = [];
  let lastId: string | null = null;
  while (true) {
    const params: Stripe.SubscriptionListParams = {
      limit: 100,
      status: "all",
      starting_after: lastId ?? undefined,
    };
    const result = await limit(() => stripe.subscriptions.list(params));
    subscriptions.push(...result.data);
    if (!result.has_more) break;
    lastId = subscriptions[subscriptions.length - 1].id;
  }
  return subscriptions.sort((a, b) => a.created - b.created);
}
