import { router } from "#modules/trpc/index";
import userRouter from "./user";
import bansRouter from "./bans";
import warnsRouter from "./warns";
//import { z } from "zod";

const authedRouter = router({
  user: userRouter,
  warns: warnsRouter,
  bans: bansRouter,
});

export default authedRouter;
