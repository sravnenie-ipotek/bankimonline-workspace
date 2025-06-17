const refinanceCredit = async (data) => {
    // Get API base URL from environment variables
    const baseUrl = process.env.VITE_NODE_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8003/api');
    const url = `${baseUrl}/refinance-credit`;
    try {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        const response = await fetch(url, opts);
        return await response.json();
    }
    catch (error) {
        console.log(error);
    }
};
export default refinanceCredit;
