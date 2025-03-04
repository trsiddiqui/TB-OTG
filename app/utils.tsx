import { faker } from "@faker-js/faker";
import { ManagerApprovalRequest, ManagerApprovalRequestStatus, RequestItem } from "../types/types";
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

export const getMockedRequest = (): ManagerApprovalRequest => {   
    const newDiscountRequest: RequestItem = {
          type: "DISCOUNT",
          typeLabel: "Discount Request",
          staffUserFullName: faker.person.fullName(),
          staffUserXRefID: uuid(),
        }
    
        const clockInTimeHour = faker.number.int({ min: 1, max: 12 });
        const clockInTimeMinutes = faker.helpers.arrayElement(["00", "30"]);
        const scheduledStartTimeHour = faker.number.int({ min: 1, max: 12 });
        const scheduledStartTimeMinutes = faker.helpers.arrayElement(["00", "30"]);
    
        const newClockInRequest: RequestItem = {
          type: "EARLY_CLOCKIN",
          typeLabel: "Early Clock-in Request",
          clockInTime: `${clockInTimeHour}:${clockInTimeMinutes}am`,
          scheduledStartTime: `${scheduledStartTimeHour}:${scheduledStartTimeMinutes}am`,
          diffFromScheduledTime: `${Math.abs(
            clockInTimeHour - scheduledStartTimeHour
          )} hours and ${Math.abs(
            parseInt(clockInTimeMinutes) - parseInt(scheduledStartTimeMinutes)
          )} minutes`,
          staffUserFullName: faker.person.fullName(),
        };
    
        const newRequest = faker.helpers.arrayElement([{
            data: newDiscountRequest,
            status: ManagerApprovalRequestStatus.REQUESTED,
            requestCreatedAt: new Date(),
            responseSentAt: new Date(),
            uuid: uuid(),
            venueXRefID: '24477'
          }, { 
            data: newClockInRequest,
            status: ManagerApprovalRequestStatus.REQUESTED,
            requestCreatedAt: new Date(),
            responseSentAt: new Date(),
            uuid: uuid(),
            venueXRefID: '24477' 
          },
        ]);
    return newRequest;
}