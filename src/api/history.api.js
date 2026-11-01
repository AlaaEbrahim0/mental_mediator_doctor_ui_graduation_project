import apiClient from "./client";

export const getPatientHistory = async (patientId, pageNumber = 1, pageSize = 20, filters = {}) => {
    const { data } = await apiClient.get(
        `/api/history/patients/${encodeURIComponent(patientId)}`,
        {
            params: {
                pageNumber,
                pageSize,
                category: filters.category || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
            },
        }
    );
    return data;
};
