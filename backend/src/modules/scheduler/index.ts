import cron from "node-cron";
import { handleBanExpiry } from "./ban";
import { handleWarnExpiry } from "./warn";
import { handleLinkExpiry } from "./link";

cron.schedule("* * * * *", handleBanExpiry, {
  noOverlap: true,
});

cron.schedule("* * * * *", handleWarnExpiry, {
  noOverlap: true,
});

cron.schedule("* * * * *", handleLinkExpiry, {
  noOverlap: true,
});
