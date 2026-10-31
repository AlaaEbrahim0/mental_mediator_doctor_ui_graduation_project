import apiClient from "./client";

export const getPatientHistory = async (patientId, pageNumber = 1, pageSize = 20) => {
    const { data } = await apiClient.get(
        `/api/history/patients/${encodeURIComponent(patientId)}`,
        { params: { pageNumber, pageSize } }
    );
    return data;
};
