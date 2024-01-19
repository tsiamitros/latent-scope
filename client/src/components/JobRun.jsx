import { useState, useEffect, useCallback } from 'react';

function jobPolling(dataset, setJob, jobId) {
  let intervalId = null
  console.log("start polling", jobId);
  intervalId = setInterval(() => {
    fetch(`http://localhost:5001/jobs/job?dataset=${dataset.id}&job_id=${jobId}`)
      .then(response => {
        if (!response.ok) {
          clearInterval(intervalId);
          setJob(null);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(jobData => {
        console.log("polling job status", jobData);
        setJob(jobData);
        if (jobData.status === "completed") {
          clearInterval(intervalId);
          setTimeout(() => {
            setJob(null);
            setJob(jobData);
          }, 200)
        }
      })
      .catch(error => {
        console.error("Error polling job status", error);
        clearInterval(intervalId);
        setJob(null)
        // TODO: have some kind of error state persist
      });
  }, 200);
  console.log("returning jobPolling cleanup")
  return () => {
    console.log("inside cleanup", intervalId)
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

function useStartJobPolling(dataset, setJob, url) {
  // const [intervalId, setIntervalId] = useState(null);
  const [cleanup, setCleanup] = useState(() => {})
  const startJob = useCallback((params) => {
    fetch(`${url}?dataset=${dataset.id}&${new URLSearchParams(params)}`)
      .then(response => response.json())
      .then(data => {
        const jobId = data.job_id;
        const cleanup = jobPolling(dataset, setJob, jobId)
        // console.log("start job cleanup", cleanup)
        // setCleanup(cleanup)
      });
  }, [dataset, setJob, url]);
  // useEffect(() => {
  //   return () => {
  //     if(cleanup)
  //       cleanup()
  //   };
  // }, [cleanup])
  return { startJob };
}

export { 
  jobPolling,
  useStartJobPolling
}