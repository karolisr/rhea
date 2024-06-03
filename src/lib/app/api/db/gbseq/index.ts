import { insertSeqRecs as _insertSeqRecs } from './insert'
import { getSeqRecsByType as _getSeqRecsByType } from './select'
import { getSeqRecsFromCollection as _getSeqRecsFromCollection } from './select'
import { getAllSeqRecs as _getAllSeqRecs } from './select'
import { addSeqRecsToCollection as _addSeqRecsToCollection } from './collections'
import { removeSeqRecsFromCollection as _removeSeqRecsFromCollection } from './collections'

export const insertGbSeqRecords = _insertSeqRecs
export const getSeqRecsByType = _getSeqRecsByType
export const getSeqRecsFromCollection = _getSeqRecsFromCollection
export const getAllSeqRecs = _getAllSeqRecs
export const addSeqRecsToCollection = _addSeqRecsToCollection
export const removeSeqRecsFromCollection = _removeSeqRecsFromCollection
