/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import { NimbusExperimentStatus } from "../../types/globalTypes";
import pluralize from "../../lib/pluralize";
import { getExperiment_experimentBySlug } from "../../types/getExperiment";
import { NotSet } from "../Summary";

const humanDate = (date: string): string => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const experimentStatus = (status: NimbusExperimentStatus) => ({
  draft: status === NimbusExperimentStatus.DRAFT,
  review: status === NimbusExperimentStatus.REVIEW,
  accepted: status === NimbusExperimentStatus.ACCEPTED,
  live: status === NimbusExperimentStatus.LIVE,
  complete: status === NimbusExperimentStatus.COMPLETE,
});

const SummaryTimeline = ({
  experiment,
}: {
  experiment: getExperiment_experimentBySlug;
}) => {
  const status = experimentStatus(experiment.status!);

  return (
    <div className="mb-5" data-testid="summary-timeline">
      <StartEnd
        {...{
          status,
          startDate: experiment.startDate,
          endDate: experiment.endDate,
        }}
      />

      <Progress
        {...{
          status,
          startDate: experiment.startDate,
          endDate: experiment.endDate,
        }}
      />

      <Duration
        {...{
          duration: experiment.proposedDuration,
          enrollment: experiment.proposedEnrollment,
        }}
      />
    </div>
  );
};

const StartEnd = ({
  status,
  startDate,
  endDate,
}: {
  status: ReturnType<typeof experimentStatus>;
  startDate: string | null;
  endDate: string | null;
}) => (
  <div className="d-flex">
    {status.draft || status.review || status.accepted ? (
      <span className="flex-fill" data-testid="label-not-launched">
        Not yet launched
      </span>
    ) : (
      <>
        <span className="flex-fill" data-testid="label-start-date">
          {humanDate(startDate!)}
        </span>
        <span className="flex-fill text-right" data-testid="label-end-date">
          {humanDate(endDate!)}
        </span>
      </>
    )}
  </div>
);

const Progress = ({
  status,
  startDate,
  endDate,
}: {
  status: ReturnType<typeof experimentStatus>;
  startDate: string | null;
  endDate: string | null;
}) => {
  const props: React.ComponentProps<typeof ProgressBar> = {
    style: { height: 5 },
    className: "my-2",
  };

  if (status.complete) {
    Object.assign(props, {
      variant: "success",
      now: 100,
    });
  } else if (status.accepted || status.live) {
    Object.assign(props, {
      striped: true,
      animated: true,
      min: Date.parse(startDate!),
      max: Date.parse(endDate!),
      now: Math.min(Date.now(), Date.parse(endDate!)),
    });
  }

  return <ProgressBar {...props} data-testid="timeline-progress-bar" />;
};

const Duration = ({
  duration,
  enrollment,
}: {
  duration: number | null;
  enrollment: number | null;
}) => (
  <span>
    Total duration:{" "}
    {duration ? (
      <b data-testid="label-duration-days">{pluralize(duration, "day")}</b>
    ) : (
      <NotSet data-testid="label-duration-not-set" />
    )}{" "}
    / Enrollment:{" "}
    {enrollment ? (
      <b data-testid="label-enrollment-days">{pluralize(enrollment, "day")}</b>
    ) : (
      <NotSet data-testid="label-enrollment-not-set" />
    )}
  </span>
);

export default SummaryTimeline;
