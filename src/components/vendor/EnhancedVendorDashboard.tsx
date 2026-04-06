import React, { useEffect, useState } from 'react';
import './EnhancedVendorDashboard.css';

const EnhancedVendorDashboard = () => {
  const [earning, setEarning] = useState(0);
  const [jobQueue, setJobQueue] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({ completed: 0, rating: 0 });
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchEarnings = () => {
      // Placeholder for real-time earnings fetch logic, fetch from API
      setEarning(prev => prev + Math.random() * 100); // Simulating earning increment
    };

    const fetchJobQueue = () => {
      // Placeholder for job queue fetch logic
      setJobQueue([{ id: 1, jobName: 'Job 1', status: 'In Progress' }, { id: 2, jobName: 'Job 2', status: 'Pending' }]); // Simulated data
    };

    const fetchPerformanceMetrics = () => {
      // Placeholder for performance metrics fetch logic
      setPerformanceMetrics({ completed: 10, rating: 4.5 }); // Simulated data
    };

    const fetchSkills = () => {
      // Placeholder for skills fetch logic
      setSkills(['JavaScript', 'React', 'CSS']); // Simulated data
    }; 

    const intervalId = setInterval(() => {
      fetchEarnings();
      fetchJobQueue();
      fetchPerformanceMetrics();
      fetchSkills();
    }, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <div className='vendor-dashboard'>
      <h1>Enhanced Vendor Dashboard</h1>
      <div className='earning-counter'>
        <h2>Current Earnings: ${earning.toFixed(2)}</h2>
      </div>
      <div className='job-queue'>
        <h3>Job Queue</h3>
        <ul>
          {jobQueue.map(job => (
            <li key={job.id}>{job.jobName} - {job.status}</li>
          ))}
        </ul>
      </div>
      <div className='performance-metrics'>
        <h3>Performance Metrics</h3>
        <p>Completed Jobs: {performanceMetrics.completed}</p>
        <p>Average Rating: {performanceMetrics.rating}</p>
      </div>
      <div className='skill-badges'>
        <h3>Skill Badges</h3>
        <div className='badges'>
          {skills.map(skill => (
            <span key={skill} className='badge'>{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVendorDashboard;
