import { apiClient } from "./client";


export async function getHistoryBooking(accessToken) {
    const { data } = await apiClient.request({
        method: "GET",
        url: `/bookings/historyBooking`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        withCredentials: true
    });

    return data;
}

export async function getDetailBooking(accessToken, bookingId) {
    const { data } = await apiClient.request({
        method: 'GET',
        url: `/bookings/detail-booking/${bookingId}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        withCredentials: true
    });
    return data
}

export async function getScheduleCar(carId) {
    const { data } = await apiClient.request({
        method: "GET",
        url: `/bookings/${carId}`,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true
    })
    return data
}

