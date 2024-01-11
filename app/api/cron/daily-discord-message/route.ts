import { differenceInDays } from "date-fns";
import { type RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v9";
import { type NextRequest } from "next/server";

import { getURL } from "@/utils/helpers";
import { fetchSubscriptions } from "@/utils/stripe";

export async function GET(request: NextRequest): Promise<Response> {
  if (!process.env.CRON_SECRET) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    // Log that we are running the cron job
    console.debug("Running cron job: daily-discord-message");

    // Get active subscriptions
    const subscriptions = await fetchSubscriptions();
    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active"
    );

    // Define variables
    const start = 50;
    const startDate = new Date("2024-01-05");
    const current = activeSubscriptions.length;
    const currentDate = new Date();
    const goal = 100;
    const goalDate = new Date("2024-02-05");

    // Cancel if goal date has passed
    if (currentDate >= goalDate) {
      console.log("Goal date has passed, skipping");
      return Response.json({ success: true });
    }

    // Calculate the remaining variables
    const daysTotal = differenceInDays(goalDate, startDate);
    const dailyGoal = Math.round((goal - start) / daysTotal);
    const daysGone = differenceInDays(currentDate, startDate);
    const expectedCurrent = Math.round(start + daysGone * dailyGoal);
    const daysRemaining = differenceInDays(goalDate, currentDate);
    const newDailyGoal = Math.round((goal - current) / daysRemaining);

    // Graph
    const imageUrl = new URL(`${getURL()}api/images/graph/graph.gif`);
    const imageUrlParams = new URLSearchParams({
      start: start.toString(),
      startDate: startDate.toISOString(),
      current: current.toString(),
      currentDate: currentDate.toISOString(),
      goal: goal.toString(),
      goalDate: goalDate.toISOString(),
      daysTotal: daysTotal.toString(),
      dailyGoal: dailyGoal.toString(),
      daysGone: daysGone.toString(),
      expectedCurrent: expectedCurrent.toString(),
      daysRemaining: daysRemaining.toString(),
      newDailyGoal: newDailyGoal.toString(),
    });
    imageUrl.search = imageUrlParams.toString();
    const finalImageUrl = imageUrl.toString();
    console.log("Image URL: ", finalImageUrl);

    // Create message
    const content =
      current < expectedCurrent
        ? `Bad news, we're behind! We should have ${expectedCurrent} active subscribers, but we only have ${current}. We need to get ${newDailyGoal} new active subscribers per day to reach our goal of ${goal} by ${
            goalDate.toISOString().split("T")[0]
          }, we have ${daysRemaining} days left.`
        : current === expectedCurrent
        ? `We're on track! We have ${current} active subscribers, and we need to get ${newDailyGoal} new active subscribers per day to reach our goal of ${goal} by ${
            goalDate.toISOString().split("T")[0]
          }, we have ${daysRemaining} days left.`
        : `We're ahead of schedule! We have ${current} active subscribers, and we need to get ${newDailyGoal} new active subscribers per day to reach our goal of ${goal} by ${
            goalDate.toISOString().split("T")[0]
          }, we have ${daysRemaining} days left.`;

    // Log message
    console.debug(`Message: "${content}"`);

    // Create payload
    const payload: RESTPostAPIWebhookWithTokenJSONBody = {
      // content,
      embeds: [
        {
          title: "Active Subscribers",
          description: content,
          color:
            current < expectedCurrent
              ? 0xff0000
              : current === expectedCurrent
              ? 0xffff00
              : 0x00ff00,
          image: {
            url: finalImageUrl,
          },
        },
      ],
    };

    // Send message to Discord
    const response = await fetch(
      "https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_SECRET}",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    // Cancel if we failed to send the message
    if (!response.ok) {
      // log error
      console.error(await response.text());
      throw new Error("Discord webhook failed");
    }

    // Return success
    return Response.json({ success: true });
  } catch (error) {
    // Log error
    console.error("Error: ", error);
    // Return failure
    return Response.json({ success: false });
  }
}
