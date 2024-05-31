export interface DragDropPayload {
  type: string
  data: unknown
  targetCanAccept: boolean
}

export interface DragStartEvent extends Event {
  payload: DragDropPayload
}

export interface DragOverEvent extends Event {
  payload: DragDropPayload
}

export interface DropEvent extends Event {
  payload: DragDropPayload
}
