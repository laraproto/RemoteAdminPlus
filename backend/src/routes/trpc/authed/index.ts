import { router } from "#modules/trpc/index";
import authedUserRouter from "./authedUser";
import bansRouter from "./bans";
import warnsRouter from "./warns";
//import { z } from "zod";

const authedRouter = router({
  authedUser: authedUserRouter,
  warns: warnsRouter,
  bans: bansRouter,
});

export default authedRouter;
