import { useState, useEffect, useCallback, useMemo } from 'react';
import ContractorService from '@config/contractorService';
import { devDebugger } from '@utils/devDebugger';
import strings from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import { getStatusStyles } from '@utils/statusUtils';
import { getLocalDateTime } from '@utils/dateUtils';

export type ClockOutTab = 'Pending' | 'Requested' | 'Completed';

export interface ExtractedClockOutData {
    requests: any[];
    attendancesRequiringClockOut: any[];
    totalPages?: number;
}

export interface ClockOutDisplayItem {
    id: string;
    rawItem: any;
    title: string;
    company: string;
    address: string;
    dateDisplay: string;
    timeDisplay: string;
    jobRate: string;
    proposedRate: string;
    statusBadgeStyle: any;
    statusTextStyle: any;
    statusLabel: string;
    reason: string;
    rejectionReason: string;
    isPending: boolean;
}

export const extractClockOutData = (resData: any): ExtractedClockOutData => {
    if (!resData) {
        return { requests: [], attendancesRequiringClockOut: [] };
    }

    const rawObj = resData.data ?? resData.results ?? resData;

    let requests: any[] = [];
    if (Array.isArray(rawObj?.data)) {
        requests = rawObj.data;
    } else if (Array.isArray(rawObj)) {
        requests = rawObj;
    } else if (rawObj && typeof rawObj === 'object') {
        const candidates = [rawObj.data, rawObj.requests, rawObj.docs];
        const found = candidates.find(Array.isArray);
        requests = found || [];
    }

    let attendances: any[] = [];
    if (Array.isArray(rawObj?.attendancesRequiringClockOut)) {
        attendances = rawObj.attendancesRequiringClockOut;
    } else if (Array.isArray(resData?.attendancesRequiringClockOut)) {
        attendances = resData.attendancesRequiringClockOut;
    }

    const pagination = rawObj?.pagination ?? resData?.pagination ?? resData?.results?.pagination;

    return {
        requests,
        attendancesRequiringClockOut: attendances,
        totalPages: pagination?.totalPages,
    };
};

export const formatClockOutItem = (item: any, activeTab: ClockOutTab): ClockOutDisplayItem => {
    const isPending = activeTab === 'Pending';

    let title = '';
    let company = '';
    let address = '';
    let startDate = '';
    let endDate = '';
    let startTime = '';
    let endTime = '';
    let jobRate = '';
    let proposedRate = '';
    let rawStatus = '';
    let reason = '';
    let rejectionReason = '';

    if (isPending) {
        // Pending section: data from attendancesRequiringClockOut
        const order = typeof item?.jobOrderId === 'object' && item?.jobOrderId !== null ? item.jobOrderId : {};
        const job = item?.Job || (typeof item?.jobId === 'object' && item?.jobId !== null ? item.jobId : {});

        title = job.title || 'Clock Out Required';
        company = job.organizationName || job.company || '';
        address = job.location || '';

        // Dates from jobOrderId (fallback to Job)
        startDate = getLocalDateTime(order.startDate || job.startDate).date || '';
        endDate = getLocalDateTime(order.endDate || job.endDate).date || '';

        // Time from startDate and endDate (fallback to order/job time strings)
        startTime = getLocalDateTime(order.startDate || job.startDate).time || order.startTime || job.startTime || '';
        endTime = getLocalDateTime(order.endDate || job.endDate).time ||'';

        const rawRate = order.finalRate ?? job.hourlyRate;
        if (rawRate != null) {
            jobRate = `${formatCurrency(rawRate)}/h`;
        }

        rawStatus = item?.displayStatus || 'CLOCK_OUT_REQUIRED';
    } else {
        // Requested / Completed section: data from data array
        const job = typeof item?.jobId === 'object' && item?.jobId !== null ? item.jobId : (item?.Job || {});

        title = job.title || 'Manual Clock-Out Request';
        company = job.organizationName || job.company || '';
        address = job.location || '';

        // Dates from jobId dictionary
        startDate = getLocalDateTime(job.startDate).date || '';
        endDate = getLocalDateTime(job.endDate).date || '';

        // Time from startDate and endDate (fallback to job time strings)
        startTime = getLocalDateTime(job.startDate).time || job.startTime || '';
        endTime = getLocalDateTime(job.endDate).time || job.endTime || '';

        if (job.hourlyRate != null) {
            jobRate = `${formatCurrency(job.hourlyRate)}/h`;
        }
        if (item?.proposedRate != null) {
            proposedRate = `${formatCurrency(item.proposedRate)}/h`;
        }

        rawStatus = item?.status || item?.requestStatus || activeTab;
        reason = item?.reason || '';
        rejectionReason = item?.rejectionReason || '';
    }

    // Date Display: show both start and end dates
    let dateDisplay = '';
    if (startDate && endDate) {
        dateDisplay = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    } else if (startDate) {
        dateDisplay = startDate;
    } else if (endDate) {
        dateDisplay = endDate;
    } else if (item?.date) {
        dateDisplay = getLocalDateTime(item.date).date;
    } else if (item?.attendanceId?.date) {
        dateDisplay = getLocalDateTime(item.attendanceId.date).date;
    }

    // Time Display: show API time strings directly
    let timeDisplay = '';
    if (item?.scheduledShift) {
        timeDisplay = item.scheduledShift;
    } else if (startTime && endTime) {
        timeDisplay = `${startTime} - ${endTime}`;
    } else if (item?.requestedClockOutTime) {
        timeDisplay = getLocalDateTime(item.requestedClockOutTime).time;
    }

    const {
        badge: statusBadgeStyle,
        text: statusTextStyle,
        label: statusLabel,
    } = getStatusStyles(rawStatus);

    return {
        id: item?._id,
        rawItem: item,
        title,
        company,
        address,
        dateDisplay,
        timeDisplay,
        jobRate,
        proposedRate,
        statusBadgeStyle,
        statusTextStyle,
        statusLabel,
        reason,
        rejectionReason,
        isPending,
    };
};

export const useClockOutViewModel = () => {
    const [activeTab, setActiveTab] = useState<ClockOutTab>('Pending');
    const [requests, setRequests] = useState<any[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    // Pagination & Loading
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const resetDataIfFirstPage = (targetPage: number) => {
        if (targetPage === 1) {
            setRequests([]);
            setAttendances([]);
        }
    };

    const fetchRequests = useCallback(async (targetPage: number, isRefresh = false) => {
        if (targetPage === 1 && !isRefresh) {
            setIsLoading(true);
        } else if (targetPage > 1) {
            setIsLoadingMore(true);
        }

        try {
            const response = await ContractorService.getManualClockOutRequests({
                page: targetPage,
                limit: 10,
            });

            if (!response?.success || !response?.data) {
                resetDataIfFirstPage(targetPage);
                return;
            }

            const {
                requests: newRequests,
                attendancesRequiringClockOut: newAttendances,
                totalPages: newTotalPages,
            } = extractClockOutData(response.data);

            if (newTotalPages) {
                setTotalPages(newTotalPages);
            }

            if (targetPage === 1) {
                setRequests(newRequests);
                setAttendances(newAttendances);
            } else {
                setRequests((prev) => [...(Array.isArray(prev) ? prev : []), ...newRequests]);
                if (newAttendances.length > 0) {
                    setAttendances((prev) => {
                        const existingIds = new Set(prev.map((a) => a?._id || a?.attendanceId));
                        const uniqueNew = newAttendances.filter((a) => !existingIds.has(a?._id || a?.attendanceId));
                        return [...prev, ...uniqueNew];
                    });
                }
            }
            setPage(targetPage);
        } catch (error) {
            devDebugger.error('Error fetching manual clock out requests:', error);
            resetDataIfFirstPage(targetPage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(1);
    }, [fetchRequests]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchRequests(1, true);
    }, [fetchRequests]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && !isLoadingMore && page < totalPages) {
            fetchRequests(page + 1);
        }
    }, [isLoading, isLoadingMore, page, totalPages, fetchRequests]);

    // Keep exact API order (no sorting on client)
    const filteredJobs = useMemo(() => {
        let list: any[] = [];

        if (activeTab === 'Pending') {
            list = attendances.filter((item) => {
                if (!item) return false;
                if (item.hasPendingRequest) return false;
                return true;
            });
        } else if (activeTab === 'Requested') {
            list = requests.filter((item) => {
                if (!item) return false;
                const status = (item?.status || item?.requestStatus || '').toUpperCase();
                return status === 'PENDING' || status === 'REQUESTED';
            });
        } else if (activeTab === 'Completed') {
            list = requests.filter((item) => {
                if (!item) return false;
                const status = (item?.status || item?.requestStatus || '').toUpperCase();
                return (
                    status === 'ACCEPTED' ||
                    status === 'APPROVED' ||
                    status === 'REJECTED' ||
                    status === 'DECLINED' ||
                    status === 'COMPLETED'
                );
            });
        }

        // Return exact API order without sorting on our end
        return list.map((item) => formatClockOutItem(item, activeTab));
    }, [activeTab, attendances, requests]);

    const emptyStateInfo = useMemo(() => {
        switch (activeTab) {
            case 'Pending':
                return {
                    title: strings.clockOutRequest.noPendingTitle,
                    description: strings.clockOutRequest.noPendingDesc,
                };
            case 'Requested':
                return {
                    title: strings.clockOutRequest.noRequestedTitle,
                    description: strings.clockOutRequest.noRequestedDesc,
                };
            case 'Completed':
                return {
                    title: strings.clockOutRequest.noCompletedTitle,
                    description: strings.clockOutRequest.noCompletedDesc,
                };
            default:
                return {
                    title: strings.clockOutRequest.noJobsFound,
                    description: strings.clockOutRequest.noJobsDesc,
                };
        }
    }, [activeTab]);

    const handleClockOutPress = useCallback((displayItem: ClockOutDisplayItem) => {
        const item = displayItem.rawItem;
        const order = typeof item?.jobOrderId === 'object' && item?.jobOrderId !== null ? item.jobOrderId : {};
        const job = item?.Job || (typeof item?.jobId === 'object' && item?.jobId !== null ? item.jobId : {});

        const rawStartDate = order.startDate || job.startDate || item?.startDate;
        const rawEndDate = order.endDate || job.endDate || item?.endDate;
        const startTime = getLocalDateTime(rawStartDate).time || order.startTime || job.startTime || '';
        const endTime = getLocalDateTime(rawEndDate).time || order.endTime || job.endTime || '';

        const mergedJob = {
            ...item,
            date: item?.date,
            dateDisplay: displayItem.dateDisplay,
            timeDisplay: displayItem.timeDisplay,
            Job: job,
            jobId: job,
            jobOrderId: item?.jobOrderId,
            startDate: rawStartDate,
            endDate: rawEndDate,
            startTime,
            endTime,
        };
        setSelectedJob(mergedJob);
        setIsPopupVisible(true);
    }, []);

    const handlePopupClose = useCallback(() => {
        setIsPopupVisible(false);
        setSelectedJob(null);
    }, []);

    const handlePopupSubmitSuccess = useCallback(() => {
        handleRefresh();
    }, [handleRefresh]);

    return {
        activeTab,
        setActiveTab,
        filteredJobs,
        emptyStateInfo,
        isLoading,
        isRefreshing,
        isLoadingMore,
        handleRefresh,
        handleLoadMore,
        selectedJob,
        isPopupVisible,
        handleClockOutPress,
        handlePopupClose,
        handlePopupSubmitSuccess,
    };
};
