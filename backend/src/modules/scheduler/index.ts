import cron from "node-cron";
import { handleBanExpiry } from "./ban";
import { handleWarnExpiry } from "./warn";

cron.schedule("* * * * *", handleBanExpiry, {
  noOverlap: true,
});

cron.schedule("* * * * *", handleWarnExpiry, {
  noOverlap: true,
});
