import prisma from "@poll/prisma";
import type { Poll, SortingParams } from "@poll/types";
import type { NextFunction, Request, Response } from "express";

import { getGeoData } from "../lib/geoip";
import { ua } from "../lib/useragent";
import {
  createPoll,
  deletePoll,
  getPoll,
  getPolls,
  getPollVoters,
  votePoll,
  getPollUserAnswerChoice,
} from "../services/poll";
import { verifyReCaptcha } from "../services/recaptcha";
import * as Analytics from "../services/tinybird";

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { sortBy, orderBy } =
      req.sorting as SortingParams<Poll.SortPollFields>;

    const data = await getPolls({ page, limit, skip, sortBy, orderBy });

    return res.send(data);
  } catch (error) {
    next(error);
  }
};

export const GetOne = async (
  req: Request<Poll.GetPollData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pollId } = req.params;
    const data = await getPoll(pollId);

    return res.send(data);
  } catch (error) {
    next(error);
  }
};

export const Create = async (
  req: Request<unknown, unknown, Poll.CreatePollData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const poll = await createPoll({
      ...data,
      userId: req.user?.id,
    });

    return res.send(poll);
  } catch (error) {
    next(error);
  }
};

export const Delete = async (
  req: Request<Poll.DeletePollData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pollId } = req.params;
    await deletePoll(pollId);
    return res.status(200).send(null);
  } catch (error) {
    next(error);
  }
};

export const Vote = async (
  req: Request<Poll.VotePollData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pollId, answerId } = req.params;
    const { reCaptchaToken } = req.body as { reCaptchaToken: string };
    const { id: userId } = req.user || {};

    const { requireRecaptcha: isReCaptchaRequired, userId: ownerId } =
      await prisma.poll.findUniqueOrThrow({
        where: { id: pollId },
        select: { requireRecaptcha: true, userId: true },
      });
    if (isReCaptchaRequired) {
      const { success: isValidCaptcha } = await verifyReCaptcha(reCaptchaToken);
      if (!isValidCaptcha) throw new Error("Invalid reCAPTCHA verification.");
    }

    const data = await votePoll({ userId, pollId, answerId });

    const ip = (req.headers["true-client-ip"] as string | undefined) || req.ip;
    const geo = await getGeoData(ip).catch(() => null);
    const userAgent = req.headers["user-agent"] || "";
    ua.setUA(userAgent).getResult();

    await Analytics.sendPollVoteData({
      user_id: userId,
      poll_id: pollId,
      owner_id: ownerId || undefined,
      vote_id: data.id,
      answer_id: answerId,
      timestamp: new Date().toISOString(),
      browser: ua.getBrowser().name,
      browser_version: ua.getBrowser().version,
      os: ua.getOS().name,
      os_version: ua.getOS().version,
      device: ua.getDevice().type,
      device_model: ua.getDevice().model,
      device_vendor: ua.getDevice().vendor,
      country_code: geo?.country_code,
      country_name: geo?.country_name,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
      region: geo?.region,
    }).catch((e) => {
      console.log("Vote Analytics error:", e);
      return null;
    });

    return res.send(data);
  } catch (error) {
    next(error);
  }
};

export const GetPollVoters = async (
  req: Request<Poll.GetVoteUsersData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pollId } = req.params;
    const data = await getPollVoters(pollId);

    return res.send(data);
  } catch (error) {
    next(error);
  }
};

export const GetPollUserAnswerChoice = async (
  req: Request<Poll.GetPollData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pollId } = req.params;
    const { id: userId } = req.user || {};

    if (!userId) return res.status(200).send({});

    const data = await getPollUserAnswerChoice(userId, pollId);

    return res.send(data);
  } catch (error) {
    next(error);
  }
};
