import { z } from 'zod'

const pieceStatus = z.enum(['painted', 'queued', 'firing', 'ready', 'collected'])
const reservationStatus = z.enum(['confirmed', 'no_show', 'cancelled'])
const id = z.string().min(1, 'ID requis')

export const OpenSessionSchema = z.object({
  tableIds: z
    .array(z.number().int().positive().max(20))
    .min(1, 'Sélectionnez au moins une table.')
    .max(5, 'Maximum 5 tables par session.'),
})

export const CloseSessionSchema = z.object({
  sessionId: id,
})

export const AdvancePieceSchema = z.object({
  pieceId:       id,
  currentStatus: pieceStatus,
})

export const UpdateReservationSchema = z.object({
  reservationId: id,
  status:        reservationStatus,
})

export const MarkOrderServedSchema = z.object({
  orderId: id,
})

export type PieceStatus        = z.infer<typeof pieceStatus>
export type ReservationStatus  = z.infer<typeof reservationStatus>
