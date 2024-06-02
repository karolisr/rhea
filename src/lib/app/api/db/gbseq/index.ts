import { insertSeqRecs as _insertSeqRecs } from './insert'
import { getSeqRecs as _getSeqRecs } from './select'
import { getAllSeqRecs as _getAllSeqRecs } from './select'
import { addSeqRecsToCollection as _addSeqRecsToCollection } from './collections'
import { removeSeqRecsFromCollection as _removeSeqRecsFromCollection } from './collections'

export const insertGbSeqRecords = _insertSeqRecs
export const getSeqRecs = _getSeqRecs
export const getAllSeqRecs = _getAllSeqRecs
export const addSeqRecsToCollection = _addSeqRecsToCollection
export const removeSeqRecsFromCollection = _removeSeqRecsFromCollection
