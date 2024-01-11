# Next.js Vercel Discord Stripe Subscribers Target Bot

Uses a cron job to update a Discord channel daily with a subscriber count target, see the [related tweet](https://x.com/PascalPixel/status/1745501003678351494?s=20) for how it looks.

The script that posts is in `app/api/cron/daily-discord-message/route.ts`, this script is run daily at 9am, this is configured in `vercel.json`. The message contains a link to an image, which is generated by `/api/images/graph/[fileName]/route.tsx`, visible below.

Be sure to fill in the .env.local and upload your environment variables to Vercel if you want to see it in action.
