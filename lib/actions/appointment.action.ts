"use server";

import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID, databases } from "../appwrite.config";
import { parseStringify } from "@/app/lib/utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export const createAppointment = async (appointment: CreateAppointmentParams) => {
    try {
        const newAppointment = await databases.createDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, ID.unique(), appointment);
        console.log()
        return parseStringify(newAppointment);
    } catch (error) {
        console.log(error);
    }
}

export const getAppointment = async (appointmentId: string) => {
    try {
        const appointment = await databases.getDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, appointmentId);

        return parseStringify(appointment);
    } catch (error) {
        console.log(error);
    }
}

export const getRecentAppointmentList = async () => {
    try {
        const appointments = await databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.orderDesc('$createdAt')]);
        const initialCount = { scheduledCount: 0, pendingCount: 0, cancelledCount: 0 };
        const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
            switch (appointment.status) {
                case "scheduled":
                    acc.scheduledCount++;
                    break;
                case "pending":
                    acc.pendingCount++;
                    break;
                case "cancelled":
                    acc.cancelledCount++;
                    break;
            }
            return acc;
        }, initialCount)
        const data = { totalCount: appointments.total, ...counts, documents: appointments.documents };
       //console.log(appointments.documents);
        return parseStringify(data);
    } catch (error) {
        console.log(error);
    }
}

export const updateAppointment = async ({ appointmentId, userId, appointment, type }: UpdateAppointmentParams) => {
    try {
        const updateAppointment = await databases.updateDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, appointmentId, appointment);
        if (!updateAppointment) throw new Error('Appointmetn not found');

        // Todo SMS notification
        revalidatePath('/admin');
        return parseStringify(updateAppointment);
    } catch (error) {
        console.log(error);
    }
}