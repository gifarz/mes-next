export interface LogPayload {
    api: string;
    resultCode: string;
    resultDesc: string;
}

export interface LogResponse {
    message: string;
    data?: {
        id: string;
        user_id: string;
        service: string;
        result_code: string;
        result_desc: string;
        created_on: string;
    };
    error?: string;
}

/**
 * Insert user logs by calling the /api/logs endpoint
 */
export async function insertUserLog(payload: LogPayload): Promise<LogResponse> {
    try {
        console.log('payload', payload)
        const res = await fetch("http://localhost:3000/api/insert/addUserLogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        console.log('userLogHelper', res.status)

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        return data as LogResponse;

    } catch (error) {
        console.error("Insert log service error:", error);
        throw error;
    }
}
