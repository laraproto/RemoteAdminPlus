import { router } from "#modules/trpc/index";
import userRouter from "./user";
//import { z } from "zod";

const authedRouter = router({
  user: userRouter,
});

export default authedRouter;
