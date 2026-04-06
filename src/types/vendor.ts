// src/types/vendor.ts

type VendorProfile = {
    id: string;
    name: string;
    contact_info: {
        email: string;
        phone: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
};

interface PerformanceMetrics {
    vendorId: string;
    rating: number;
    totalJobs: number;
    completedJobs: number;
    successRate: number; // in percentage
    averageResponseTime: number; // in seconds
}

interface Earnings {
    vendorId: string;
    totalEarnings: number;
    earningsThisMonth: number;
    earningsLastMonth: number;
    earningsThisYear: number;
}

interface Job {
    jobId: string;
    vendorId: string;
    description: string;
    status: "pending" | "in-progress" | "completed" | "canceled";
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
}

interface RealTimeData {
    vendorId: string;
    currentJobs: number;
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    lastActivity: string; // ISO 8601 format
};

export type { VendorProfile, PerformanceMetrics, Earnings, Job, RealTimeData };