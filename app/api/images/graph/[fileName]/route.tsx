import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    if (!request.url) throw new Error("No URL");
    const { searchParams } = new URL(request.url);

    // ?width=<width>
    const hasWidthParam = searchParams.has("width");
    const width = hasWidthParam
      ? parseInt(searchParams.get("width") || "500")
      : 500;

    // ?height=<height>
    const hasHeightParam = searchParams.has("height");
    const height = hasHeightParam
      ? parseInt(searchParams.get("height") || "250")
      : 250;

    // ?start=<start>
    const hasStartParam = searchParams.has("start");
    const start = hasStartParam
      ? parseInt(searchParams.get("start") || "0")
      : 0;

    // ?startDate=<startDate>
    const hasStartDateParam = searchParams.has("startDate");
    const startDate = hasStartDateParam
      ? new Date(searchParams.get("startDate") || "")
      : new Date();

    // ?current=<current>
    const hasCurrentParam = searchParams.has("current");
    const current = hasCurrentParam
      ? parseInt(searchParams.get("current") || "0")
      : 0;

    // ?currentDate=<currentDate>
    const hasCurrentDateParam = searchParams.has("currentDate");
    const currentDate = hasCurrentDateParam
      ? new Date(searchParams.get("currentDate") || "")
      : new Date();

    // ?goal=<goal>
    const hasGoalParam = searchParams.has("goal");
    const goal = hasGoalParam ? parseInt(searchParams.get("goal") || "0") : 0;

    // ?goalDate=<goalDate>
    const hasGoalDateParam = searchParams.has("goalDate");
    const goalDate = hasGoalDateParam
      ? new Date(searchParams.get("goalDate") || "")
      : new Date();

    // ?daysTotal=<daysTotal>
    const hasDaysTotalParam = searchParams.has("daysTotal");
    const daysTotal = hasDaysTotalParam
      ? parseInt(searchParams.get("daysTotal") || "0")
      : 0;

    // ?dailyGoal=<dailyGoal>
    const hasDailyGoalParam = searchParams.has("dailyGoal");
    const dailyGoal = hasDailyGoalParam
      ? parseInt(searchParams.get("dailyGoal") || "0")
      : 0;

    // ?daysGone=<daysGone>
    const hasDaysGoneParam = searchParams.has("daysGone");
    const daysGone = hasDaysGoneParam
      ? parseInt(searchParams.get("daysGone") || "0")
      : 0;

    // ?expectedCurrent=<expectedCurrent>
    const hasExpectedCurrentParam = searchParams.has("expectedCurrent");
    const expectedCurrent = hasExpectedCurrentParam
      ? parseInt(searchParams.get("expectedCurrent") || "0")
      : 0;

    // ?daysRemaining=<daysRemaining>
    const hasDaysRemainingParam = searchParams.has("daysRemaining");
    const daysRemaining = hasDaysRemainingParam
      ? parseInt(searchParams.get("daysRemaining") || "0")
      : 0;

    // ?newDailyGoal=<newDailyGoal>
    const hasNewDailyGoalParam = searchParams.has("newDailyGoal");
    const newDailyGoal = hasNewDailyGoalParam
      ? parseInt(searchParams.get("newDailyGoal") || "0")
      : 0;

    console.log(
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
          }, we have ${daysRemaining} days left.`
    );

    const svgHeight = height - 10 - 10 - 50;
    const svgWidth = width - 10 - 10;

    // Correctly scale the values for the SVG's coordinate system
    const scaleY = (value: number) => svgHeight - (svgHeight * value) / goal;
    const scaleX = (days: number) => (svgWidth * days) / daysTotal;

    return new ImageResponse(
      (
        <div
          style={{
            background: "black",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "10px",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>{start.toString()}</div>
            <div>{current.toString()}</div>
            <div>{goal.toString()}</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ padding: "10px" }}
          >
            {/* Start-End Line (Adjusted) */}
            <line
              x1={scaleX(0)}
              y1={scaleY(start)}
              x2={scaleX(daysTotal)}
              y2={scaleY(goal)}
              stroke="gray"
              stroke-width="2"
            />

            {/* Start-Current Line (Adjusted) */}
            <line
              x1={scaleX(0)}
              y1={scaleY(start)}
              x2={scaleX(daysGone)}
              y2={scaleY(current)}
              stroke="red"
              stroke-width="2"
            />

            {/* Dot on Current */}
            <circle
              cx={scaleX(daysGone) + 2.5}
              cy={scaleY(current) + 2.5}
              r="5"
              fill="red"
            />

            {/* Dot on Expected Current */}
            <circle
              cx={scaleX(daysGone) + 2.5}
              cy={scaleY(expectedCurrent) + 2.5}
              r="5"
              fill="gray"
            />
          </svg>
          <div
            style={{
              padding: "10px",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>{startDate.toISOString().split("T")[0]}</div>
            <div>{currentDate.toISOString().split("T")[0]}</div>
            <div>{goalDate.toISOString().split("T")[0]}</div>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (e) {
    const error = e as Error;
    console.error(error.message.toString());
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
