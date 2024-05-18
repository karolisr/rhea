import type { GBFeatureSet, GBSeq } from '$lib/ncbi/types/GBSet'
import {
  DB,
  beginTransaction,
  commitTransaction,
  vacuum
} from '$lib/app/api/db'
import { getTaxId } from '$lib/ncbi/utils'
import sql, { Sql, bulk, empty } from 'sql-template-tag'
import databases from '$lib/app/svelte-stores/databases'

function nValsPerSqlInsertSet(sql: Sql) {
  return sql.strings.slice(1, -1).join('').split('),(')[0].split(',').length
}

export async function insertSeqRecs(records: GBSeq[]) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | undefined = undefined
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  if (db !== undefined) {
    const nBatchesRec = 1
    const batchSizeRec = Math.floor(records.length / nBatchesRec)
    for (let i = 0; i < records.length; i += batchSizeRec) {
      const batchRec = records.slice(i, i + batchSizeRec)
      try {
        const _sqls: Sql[] = _prep(batchRec)
        await beginTransaction(db)
        for (let j = 0; j < _sqls.length; j++) {
          const _sql = _sqls[j]
          const sqlValsCount = _sql.values.length
          if (sqlValsCount > 0) {
            // ----------------------------------------------------------------
            const sqlSetSize = nValsPerSqlInsertSet(_sql)
            const batchSizeVal = Math.floor(750 / sqlSetSize) * sqlSetSize
            for (let k = 0; k < sqlValsCount; k += batchSizeVal) {
              const valsStrPieces = []
              const batchVal = _sql.values.slice(k, k + batchSizeVal)
              for (let l = 0; l < batchVal.length; l += sqlSetSize) {
                valsStrPieces.push(
                  `${new Array(sqlSetSize)
                    .fill(1)
                    .map((v, z) => `$${l + z + 1}`)
                    .join()}`
                )
              }
              const sqlText =
                _sql.strings[0] +
                valsStrPieces.join('),(') +
                '' +
                _sql.strings[_sql.strings.length - 1]
              await (db as DB).execute(sqlText, batchVal)
            }
            // ----------------------------------------------------------------
          }
        }
        await commitTransaction(db)
        console.log('insertSeqRecs: Done.')
      } catch (error) {
        await commitTransaction(db)
        console.error('Error in insertSeqRecs:', error)
      }
    }
    // console.log('insertSeqRecs: Vacuuming Begin.')
    // await vacuum(db)
    // console.log('insertSeqRecs: Vacuuming Done.')
  }
  unsubscribe()
}

function _struccommentitems(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_struc_comment_items (
        "accession_version",
        "struc_comment_id",
        "struc_comment_item_id",
        "tag",
        "url",
        "value"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "struc_comment_id",
      "struc_comment_item_id"
    ) DO NOTHING
    ;
  `
}

function _struccomments(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_struc_comments (
        "accession_version",
        "struc_comment_id",
        "name"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "struc_comment_id"
    ) DO NOTHING
    ;
  `
}

function _commentparagraphs(values: (string | number)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_comment_paragraphs (
        "accession_version",
        "comment_id",
        "paragraph_id",
        "paragraph"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "comment_id",
      "paragraph_id"
    ) DO NOTHING
    ;
  `
}

function _comments(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_comments (
        "accession_version",
        "comment_id",
        "type"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "comment_id"
    ) DO NOTHING
    ;
  `
}

function _altseqdataitems(values: (string | number | boolean | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_alt_seq_items (
        "accession_version",
        "alt_seq_data_id",
        "alt_seq_item_id",
        "feature_set_id",
        "feature_id",
        "interval_id",
        "first_accn",
        "gap_comment",
        "gap_length",
        "gap_linkage",
        "gap_type",
        "isgap",
        "last_accn",
        "value"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "alt_seq_data_id",
      "alt_seq_item_id"
    ) DO NOTHING
    ;
  `
}

function _altseqdata(values: (string | number)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_alt_seq_data (
        "accession_version",
        "alt_seq_data_id",
        "name"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "alt_seq_data_id"
    ) DO NOTHING
    ;
  `
}

function _secondaryaccns(values: string[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_secondary_accns ("accession_version", "accn")
    VALUES
      ${bulk(values)}
    ON CONFLICT ("accn_id") DO NOTHING
    ;
  `
}

function _seqids(values: string[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_seqids ("accession_version", "seqid")
    VALUES
      ${bulk(values)}
    ON CONFLICT ("seqid_id") DO NOTHING
    ;
  `
}

function _keywords(values: string[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_keywords (
        "accession_version",
        "keyword"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT ("keyword_id") DO NOTHING
    ;
  `
}

function _authors(values: (string | number)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_authors (
        "accession_version",
        "reference_id",
        "author_id",
        "author"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "reference_id",
      "author_id"
    ) DO NOTHING
    ;
  `
}

function _xrefs(values: (string | number)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_xrefs (
        "accession_version",
        "feature_set_id",
        "feature_id",
        "reference_id",
        "xref_id",
        "dbname",
        "id"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "feature_set_id",
      "feature_id",
      "reference_id",
      "xref_id"
    ) DO NOTHING
    ;
  `
}

function _references(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_references (
        "accession_version",
        "reference_id",
        "journal",
        "reference",
        "consortium",
        "position",
        "pubmed",
        "remark",
        "title"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "reference_id"
    ) DO NOTHING
    ;
  `
}

function _qualifiers(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_qualifiers (
        "accession_version",
        "feature_set_id",
        "feature_id",
        "qualifier_id",
        "name",
        "value"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "feature_set_id",
      "feature_id",
      "qualifier_id"
    ) DO NOTHING
    ;
  `
}

function _intervals(values: (string | number | boolean | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_intervals (
        "accession_version",
        "feature_set_id",
        "feature_id",
        "interval_id",
        "accession",
        "from",
        "to",
        "point",
        "iscomp",
        "interbp"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "feature_set_id",
      "feature_id",
      "interval_id"
    ) DO NOTHING
    ;
  `
}

function _features(values: (string | number | boolean | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_features (
        "accession_version",
        "feature_set_id",
        "feature_id",
        "key",
        "location",
        "operator",
        "partial3",
        "partial5"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "feature_set_id",
      "feature_id"
    ) DO NOTHING
    ;
  `
}

function _featureSets(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_feature_sets (
        "accession_version",
        "feature_set_id",
        "annot_source"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT (
      "accession_version",
      "feature_set_id"
    ) DO NOTHING
    ;
  `
}

function _sequences(values: (string | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_sequences ("accession_version", sequence)
    VALUES
      ${bulk(values)}
    ON CONFLICT ("accession_version") DO NOTHING
    ;
  `
}

function _metadata(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      gb_records (
        "accession_version",
        "tax_id",
        "length",
        "moltype",
        "definition",
        "comment",
        "contig",
        "database_reference",
        "entry_version",
        "locus",
        "primary",
        "primary_accession",
        "project",
        "segment",
        "source",
        "source_db",
        "strandedness",
        "topology",
        "create_date",
        "create_release",
        "update_date",
        "update_release"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT ("accession_version") DO NOTHING
    ;
  `
}

function _prep(records: GBSeq[]): Sql[] {
  const metadataVs = []
  const sequenceVs = []
  const featSetVs = []
  const featVs = []
  const intervalVs = []
  const qualifierVs = []
  const referenceVs = []
  const xRefVs = []
  const authorVs = []
  const keywordVs = []
  const altSeqDataVs = []
  const altSeqDataItemVs = []
  const seqIdVs = []
  const secondaryAccnVs = []
  const commVs = []
  const commParaVs = []
  const strucCommVs = []
  const strucCommItemVs = []
  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const accVer: string = r.GBSeq_accession_version
    const taxid: number | undefined = getTaxId(r)
    const defaultFeatureSet: GBFeatureSet = {
      GBFeatureSet_features: [],
      GBFeatureSet_annot_source: 'default'
    }
    let lastIntervalId: number = 0
    if (r.GBSeq_feature_table) {
      defaultFeatureSet.GBFeatureSet_features = r.GBSeq_feature_table
    }
    if (r.GBSeq_feature_set !== undefined) {
      r.GBSeq_feature_set = [defaultFeatureSet, ...r.GBSeq_feature_set]
    } else {
      r.GBSeq_feature_set = [defaultFeatureSet]
    }

    featVs.push([accVer, 0, 0, '', '', undefined, undefined, undefined]) // Default Feature
    for (let j = 0; j < r.GBSeq_feature_set.length; j++) {
      const fs = r.GBSeq_feature_set[j]
      featSetVs.push([accVer, j, fs.GBFeatureSet_annot_source])
      const features = fs['GBFeatureSet_features']
      for (let k = 0; k < features.length; k++) {
        const f = features[k]
        featVs.push([
          accVer,
          j,
          k + 1,
          f.GBFeature_key,
          f.GBFeature_location,
          f.GBFeature_operator,
          f.GBFeature_partial3,
          f.GBFeature_partial5
        ])

        const intervals = f.GBFeature_intervals
        if (intervals) {
          for (let x = 0; x < intervals.length; x++) {
            lastIntervalId = x + 1
            const intv = intervals[x]
            intervalVs.push([
              accVer,
              j,
              k + 1,
              lastIntervalId,
              intv.GBInterval_accession,
              intv.GBInterval_from,
              intv.GBInterval_to,
              intv.GBInterval_point,
              intv.GBInterval_iscomp,
              intv.GBInterval_interbp
            ])
          }
        }

        const qualifiers = f.GBFeature_quals
        if (qualifiers) {
          for (let x = 0; x < qualifiers.length; x++) {
            const qual = qualifiers[x]
            qualifierVs.push([
              accVer,
              j,
              k + 1,
              x + 1,
              qual.GBQualifier_name,
              qual.GBQualifier_value
            ])
          }
        }

        const featXRefs = f.GBFeature_xrefs
        if (featXRefs) {
          for (let x = 0; x < featXRefs.length; x++) {
            const xref = featXRefs[x]
            xRefVs.push([
              accVer,
              j,
              k + 1,
              0,
              x + 1,
              xref.GBXref_dbname,
              xref.GBXref_id
            ])
          }
        }
      }
    }

    referenceVs.push([
      accVer,
      0,
      '',
      '',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ]) // Default Reference
    const recReferences = r.GBSeq_references
    if (recReferences) {
      for (let y = 0; y < recReferences.length; y++) {
        const ref = recReferences[y]
        referenceVs.push([
          accVer,
          y + 1,
          ref.GBReference_journal,
          ref.GBReference_reference,
          ref.GBReference_consortium,
          ref.GBReference_position,
          ref.GBReference_pubmed,
          ref.GBReference_remark,
          ref.GBReference_title
        ])

        const refXRefs = ref.GBReference_xref
        if (refXRefs) {
          for (let x = 0; x < refXRefs.length; x++) {
            const xref = refXRefs[x]
            xRefVs.push([
              accVer,
              0,
              0,
              y + 1,
              x + 1,
              xref.GBXref_dbname,
              xref.GBXref_id
            ])
          }
        }

        const refAuthors = ref.GBReference_authors
        if (refAuthors) {
          for (let x = 0; x < refAuthors.length; x++) {
            const author = refAuthors[x]
            authorVs.push([accVer, y + 1, x + 1, author.GBAuthor])
          }
        }
      }
    }

    const recXRefs = r.GBSeq_xrefs
    if (recXRefs) {
      for (let x = 0; x < recXRefs.length; x++) {
        const xref = recXRefs[x]
        xRefVs.push([
          accVer,
          0,
          0,
          0,
          x + 1,
          xref.GBXref_dbname,
          xref.GBXref_id
        ])
      }
    }

    const recComments = r.GBSeq_comment_set
    if (recComments) {
      for (let y = 0; y < recComments.length; y++) {
        const comm = recComments[y]
        commVs.push([accVer, y + 1, comm.GBComment_type])
        const commParas = comm.GBComment_paragraphs
        if (commParas) {
          for (let x = 0; x < commParas.length; x++) {
            const para = commParas[x]
            commParaVs.push([accVer, y + 1, x + 1, para.GBCommentParagraph])
          }
        }
      }
    }

    const recStrucComments = r.GBSeq_struc_comments
    if (recStrucComments) {
      for (let y = 0; y < recStrucComments.length; y++) {
        const scomm = recStrucComments[y]
        strucCommVs.push([accVer, y + 1, scomm.GBStrucComment_name])
        const scommis = scomm.GBStrucComment_items
        if (scommis) {
          for (let x = 0; x < scommis.length; x++) {
            const scommi = scommis[x]
            strucCommItemVs.push([
              accVer,
              y + 1,
              x + 1,
              scommi.GBStrucCommentItem_tag,
              scommi.GBStrucCommentItem_url,
              scommi.GBStrucCommentItem_value
            ])
          }
        }
      }
    }

    const recKeywords = r.GBSeq_keywords
    if (recKeywords) {
      for (let x = 0; x < recKeywords.length; x++) {
        const kw = recKeywords[x]
        keywordVs.push([accVer, kw.GBKeyword])
      }
    }

    const recSeqIds = r.GBSeq_other_seqids
    if (recSeqIds) {
      for (let x = 0; x < recSeqIds.length; x++) {
        const osi = recSeqIds[x]
        seqIdVs.push([accVer, osi.GBSeqid])
      }
    }

    const recSecAccns = r.GBSeq_secondary_accessions
    if (recSecAccns) {
      for (let x = 0; x < recSecAccns.length; x++) {
        const sa = recSecAccns[x]
        secondaryAccnVs.push([accVer, sa.GBSecondary_accn])
      }
    }

    const recAltSeqData = r.GBSeq_alt_seq
    if (recAltSeqData) {
      for (let y = 0; y < recAltSeqData.length; y++) {
        const asd = recAltSeqData[y]
        altSeqDataVs.push([accVer, y + 1, asd.GBAltSeqData_name])
        const recAltSeqDataItems = asd.GBAltSeqData_items
        if (recAltSeqDataItems) {
          for (let x = 0; x < recAltSeqDataItems.length; x++) {
            const asdi = recAltSeqDataItems[x]
            const intv = asdi.GBAltSeqItem_interval
            if (intv) {
              lastIntervalId += 1
              intervalVs.push([
                accVer,
                0,
                0,
                lastIntervalId,
                intv.GBInterval_accession,
                intv.GBInterval_from,
                intv.GBInterval_to,
                intv.GBInterval_point,
                intv.GBInterval_iscomp,
                intv.GBInterval_interbp
              ])
            }
            altSeqDataItemVs.push([
              accVer,
              y + 1,
              x,
              0,
              0,
              lastIntervalId,
              asdi.GBAltSeqItem_first_accn,
              asdi.GBAltSeqItem_gap_comment,
              asdi.GBAltSeqItem_gap_length,
              asdi.GBAltSeqItem_gap_linkage,
              asdi.GBAltSeqItem_gap_type,
              asdi.GBAltSeqItem_isgap,
              asdi.GBAltSeqItem_last_accn,
              asdi.GBAltSeqItem_value
            ])
          }
        }
      }
    }

    if (r.GBSeq_sequence !== undefined) {
      sequenceVs.push([accVer, r.GBSeq_sequence])
    }
    metadataVs.push([
      accVer,
      taxid,
      r.GBSeq_length,
      r.GBSeq_moltype,
      r.GBSeq_definition,
      r.GBSeq_comment,
      r.GBSeq_contig,
      r.GBSeq_database_reference,
      r.GBSeq_entry_version,
      r.GBSeq_locus,
      r.GBSeq_primary,
      r.GBSeq_primary_accession,
      r.GBSeq_project,
      r.GBSeq_segment,
      r.GBSeq_source,
      r.GBSeq_source_db,
      r.GBSeq_strandedness,
      r.GBSeq_topology,
      r.GBSeq_create_date,
      r.GBSeq_create_release,
      r.GBSeq_update_date,
      r.GBSeq_update_release
    ])
  }

  const rv = [
    _metadata(metadataVs),
    _sequences(sequenceVs),
    _featureSets(featSetVs),
    _features(featVs),
    _intervals(intervalVs),
    _qualifiers(qualifierVs),
    _references(referenceVs),
    _xrefs(xRefVs),
    _authors(authorVs),
    _keywords(keywordVs),
    _altseqdata(altSeqDataVs),
    _altseqdataitems(altSeqDataItemVs),
    _seqids(seqIdVs),
    _secondaryaccns(secondaryAccnVs),
    _comments(commVs),
    _commentparagraphs(commParaVs),
    _struccomments(strucCommVs),
    _struccommentitems(strucCommItemVs)
  ]

  return rv
}
