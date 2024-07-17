// IUPAC

export const NT_SHARED_CHARS = new Set('ACG')
export const NT_AMBIGUOUS_CHARS = new Set('BDHKMNRSVWY')
export const NT_GAPS_STRING = '-.'
export const NT_GAPS_CHARS = new Set(NT_GAPS_STRING)
export const DNA_ONLY_CHARS = new Set('T')
export const RNA_ONLY_CHARS = new Set('U')

export const AA_CHARS = new Set('GAVLIPFYCMHKRWSTDENQ*')
export const AA_AMBIGUOUS_CHARS = new Set('BZX')
export const AA_GAPS_STRING = '-.'
export const AA_GAPS_CHARS = new Set(AA_GAPS_STRING)

export const DNA_UNAMBIGUOUS = new Set([...NT_SHARED_CHARS, ...DNA_ONLY_CHARS])
export const DNA_UNAMBIGUOUS_GAPS = new Set([
  ...DNA_UNAMBIGUOUS,
  ...NT_GAPS_CHARS
])
export const DNA_AMBIGUOUS = new Set([
  ...DNA_UNAMBIGUOUS,
  ...NT_AMBIGUOUS_CHARS
])
export const DNA_AMBIGUOUS_GAPS = new Set([...DNA_AMBIGUOUS, ...NT_GAPS_CHARS])

export const RNA_UNAMBIGUOUS = new Set([...NT_SHARED_CHARS, ...RNA_ONLY_CHARS])
export const RNA_UNAMBIGUOUS_GAPS = new Set([
  ...RNA_UNAMBIGUOUS,
  ...NT_GAPS_CHARS
])
export const RNA_AMBIGUOUS = new Set([
  ...RNA_UNAMBIGUOUS,
  ...NT_AMBIGUOUS_CHARS
])
export const RNA_AMBIGUOUS_GAPS = new Set([...RNA_AMBIGUOUS, ...NT_GAPS_CHARS])

export const NT_UNAMBIGUOUS = new Set([...DNA_UNAMBIGUOUS, ...RNA_UNAMBIGUOUS])
export const NT_UNAMBIGUOUS_GAPS = new Set([
  ...DNA_UNAMBIGUOUS_GAPS,
  ...RNA_UNAMBIGUOUS_GAPS
])
export const NT_AMBIGUOUS = new Set([...DNA_AMBIGUOUS, ...RNA_AMBIGUOUS])
export const NT_AMBIGUOUS_GAPS = new Set([
  ...DNA_AMBIGUOUS_GAPS,
  ...RNA_AMBIGUOUS_GAPS
])

export const AA_UNAMBIGUOUS = new Set([...AA_CHARS])
export const AA_UNAMBIGUOUS_GAPS = new Set([
  ...AA_UNAMBIGUOUS,
  ...AA_GAPS_CHARS
])
export const AA_AMBIGUOUS = new Set([...AA_UNAMBIGUOUS, ...AA_AMBIGUOUS_CHARS])
export const AA_AMBIGUOUS_GAPS = new Set([...AA_AMBIGUOUS, ...AA_GAPS_CHARS])

export const AA_ONLY_CHARS = AA_AMBIGUOUS.difference(NT_AMBIGUOUS)

const DNA_COMPLEMENT_CHARS_1 = 'ACGTRYMKWSBDHV'
const DNA_COMPLEMENT_CHARS_2 = 'TGCAYRKMWSVHDB'
// ToDo: (from Python)
// DNA_COMPLEMENT_TABLE = str.maketrans(DNA_COMPLEMENT_CHARS_1, DNA_COMPLEMENT_CHARS_2);

export const IUPAC_DNA_DICT = new Map([
  ['A', 'A'],
  ['C', 'C'],
  ['G', 'G'],
  ['T', 'T'],
  ['AG', 'R'],
  ['CT', 'Y'],
  ['AC', 'M'],
  ['GT', 'K'],
  ['AT', 'W'],
  ['CG', 'S'],
  ['CGT', 'B'],
  ['AGT', 'D'],
  ['ACT', 'H'],
  ['ACG', 'V'],
  ['ACGT', 'N']
])

export const IUPAC_DNA_DICT_REVERSE = new Map([
  ['A', 'A'],
  ['C', 'C'],
  ['G', 'G'],
  ['T', 'T'],
  ['R', 'AG'],
  ['Y', 'CT'],
  ['M', 'AC'],
  ['K', 'GT'],
  ['W', 'AT'],
  ['S', 'CG'],
  ['B', 'CGT'],
  ['D', 'AGT'],
  ['H', 'ACT'],
  ['V', 'ACG'],
  ['N', 'ACGT']
])

export const IUPAC_AMBIGUOUS_DNA_DICT = new Map([
  ['AG', 'R'],
  ['CT', 'Y'],
  ['AC', 'M'],
  ['GT', 'K'],
  ['AT', 'W'],
  ['CG', 'S'],
  ['CGT', 'B'],
  ['AGT', 'D'],
  ['ACT', 'H'],
  ['ACG', 'V'],
  ['ACGT', 'N']
])

export const IUPAC_AMBIGUOUS_SECOND_ORDER_DNA_DICT_REVERSE = new Map([
  ['N', 'ACGTBDHKMRSVWY'],
  ['V', 'ACGMRS'],
  ['H', 'ACTMWY'],
  ['D', 'AGTKRW'],
  ['B', 'CGTKSY']
])

// IUPAC        Three
// amino acid   letter  Amino
// code         code    acid

//  A           Ala     Alanine
//  C           Cys     Cysteine
//  D           Asp     Aspartic Acid
//  E           Glu     Glutamic Acid
//  F           Phe     Phenylalanine
//  G           Gly     Glycine
//  H           His     Histidine
//  I           Ile     Isoleucine
//  K           Lys     Lysine
//  L           Leu     Leucine
//  M           Met     Methionine
//  N           Asn     Asparagine
//  P           Pro     Proline
//  Q           Gln     Glutamine
//  R           Arg     Arginine
//  S           Ser     Serine
//  T           Thr     Threonine
//  V           Val     Valine
//  W           Trp     Tryptophan
//  Y           Tyr     Tyrosine

export const IUPAC_AA_NAMES_TLC = new Map([
  ['A', 'Ala'],
  ['C', 'Cys'],
  ['D', 'Asp'],
  ['E', 'Glu'],
  ['F', 'Phe'],
  ['G', 'Gly'],
  ['H', 'His'],
  ['I', 'Ile'],
  ['K', 'Lys'],
  ['L', 'Leu'],
  ['M', 'Met'],
  ['N', 'Asn'],
  ['P', 'Pro'],
  ['Q', 'Gln'],
  ['R', 'Arg'],
  ['S', 'Ser'],
  ['T', 'Thr'],
  ['V', 'Val'],
  ['W', 'Trp'],
  ['Y', 'Tyr']
])

export const IUPAC_AA_NAMES_FULL = new Map([
  ['A', 'Alanine'],
  ['C', 'Cysteine'],
  ['D', 'Aspartic Acid'],
  ['E', 'Glutamic Acid'],
  ['F', 'Phenylalanine'],
  ['G', 'Glycine'],
  ['H', 'Histidine'],
  ['I', 'Isoleucine'],
  ['K', 'Lysine'],
  ['L', 'Leucine'],
  ['M', 'Methionine'],
  ['N', 'Asparagine'],
  ['P', 'Proline'],
  ['Q', 'Glutamine'],
  ['R', 'Arginine'],
  ['S', 'Serine'],
  ['T', 'Threonine'],
  ['V', 'Valine'],
  ['W', 'Tryptophan'],
  ['Y', 'Tyrosine']
])

// IUPAC
// nucleotide
// code         Base

// A            Adenine
// C            Cytosine
// G            Guanine
// T (or U)     Thymine (or Uracil)
// R            A or G
// Y            C or T
// S            G or C
// W            A or T
// K            G or T
// M            A or C
// B            C or G or T
// D            A or G or T
// H            A or C or T
// V            A or C or G
// N            any base
// . or -       gap
