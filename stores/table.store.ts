import { create } from 'zustand'
import type { TableGroup, OrderItem } from '@/types/database'

// État du flow client depuis la webapp table (QR)
interface TableFlowState {
  tableGroup: TableGroup | null
  clientInfo: { firstName: string; email: string; phone?: string } | null
  selectedPiece: { name: string; price: number } | null
  orderItems: OrderItem[]
  generatedToken: string | null

  setTableGroup: (group: TableGroup | null) => void
  setClientInfo: (info: TableFlowState['clientInfo']) => void
  setSelectedPiece: (piece: TableFlowState['selectedPiece']) => void
  addOrderItem: (item: Omit<OrderItem, 'qty'>) => void
  removeOrderItem: (name: string) => void
  updateQty: (name: string, qty: number) => void
  setGeneratedToken: (token: string) => void
  reset: () => void
}

export const useTableFlow = create<TableFlowState>((set) => ({
  tableGroup: null,
  clientInfo: null,
  selectedPiece: null,
  orderItems: [],
  generatedToken: null,

  setTableGroup: (group) => set({ tableGroup: group }),
  setClientInfo: (info) => set({ clientInfo: info }),
  setSelectedPiece: (piece) => set({ selectedPiece: piece }),

  addOrderItem: (item) =>
    set((state) => {
      const existing = state.orderItems.find((i) => i.name === item.name)
      if (existing) {
        return {
          orderItems: state.orderItems.map((i) =>
            i.name === item.name ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return { orderItems: [...state.orderItems, { ...item, qty: 1 }] }
    }),

  removeOrderItem: (name) =>
    set((state) => ({ orderItems: state.orderItems.filter((i) => i.name !== name) })),

  updateQty: (name, qty) =>
    set((state) => ({
      orderItems:
        qty <= 0
          ? state.orderItems.filter((i) => i.name !== name)
          : state.orderItems.map((i) => (i.name === name ? { ...i, qty } : i)),
    })),

  setGeneratedToken: (token) => set({ generatedToken: token }),
  reset: () =>
    set({ tableGroup: null, clientInfo: null, selectedPiece: null, orderItems: [], generatedToken: null }),
}))
