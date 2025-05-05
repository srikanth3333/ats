"use client";

import { useState } from "react";
import { JobCard } from "./job-card";

export function JobList({ jobs }: any) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      {/* <SearchBar
        value={searchQuery}
        onChange={(value) => setSearchQuery(value)}
        jobCount={jobs.length}
      /> */}

      <div className="mt-8 space-y-6">
        {jobs.map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
