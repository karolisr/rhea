export interface DragDropPayload {
  type: string
  data: unknown
  targetCanAccept: boolean
  showWhileDraggingEl: HTMLElement | null
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
