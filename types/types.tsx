export enum ApprovalRequestType {
  DISCOUNT = 'DISCOUNT',
  CLOCK_IN = 'EARLY_CLOCKIN',
}

export enum ManagerApprovalRequestStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUESTED = 'REQUESTED',
}

export type DiscountApprovalRequest = {
  type: 'DISCOUNT'
  typeLabel: 'Discount Request'
  staffUserXRefID: string
  staffUserFullName: string
}
export type DiscountProcessedRequest = DiscountApprovalRequest & {
  status: 'APPROVED' | 'REJECTED'
}

export type EarlyClockinApprovalRequest = {
  type: 'EARLY_CLOCKIN'
  typeLabel: 'Early Clock-in Request'
  staffUserFullName: string
  diffFromScheduledTime: string
  clockInTime: string
  scheduledStartTime: string
}
export type EarlyClockinProcessedRequest = EarlyClockinApprovalRequest & {
  status: 'APPROVED' | 'REJECTED'
}
// Union type combining both request types
export type RequestItem = DiscountApprovalRequest | EarlyClockinApprovalRequest
export type ProcessedRequestItem = DiscountProcessedRequest | EarlyClockinProcessedRequest

export type ManagerApprovalRequest = {
  uuid: string
  venueXRefID: string
  data: RequestItem
  status: ManagerApprovalRequestStatus
  requestCreatedAt: Date
  responseSentAt: Date
}