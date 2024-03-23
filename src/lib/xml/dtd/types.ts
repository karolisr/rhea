interface DTDItemRaw {
  [key: string]: string | undefined
}

interface DTDEntityRaw extends DTDItemRaw {
  entity_name: string
  entity_pubsys?: string
  entity_description?: string
  entity_value?: string
  entity_url?: string
}

interface DTDAttributeRaw extends DTDItemRaw {
  element_name: string
  attribute_name: string
  attribute_type: string
  attribute_value: string
}

interface DTDElementRaw extends DTDItemRaw {
  element_name: string
  category?: string
  element_content?: string
}

interface DTDRaw {
  doctypes: DTDEntityRaw[]
  entities: DTDEntityRaw[]
  attributes: _dtd_attribute[]
  elements: DTDElementRaw[]
}

type DTDRawPromise = Promise<DTDRaw>

interface _dtd_element {
  children: null | { [key: string]: { type: string; required: string } }
  value: null | { type: string; required: string }
  attributes: null | {
    [attribute_name: string]: {
      type: string
      value: string
      possible_values: string[]
    }
  }
}

interface _dtd_attribute {
  element_name: string
  name: string
  type: string
  value: string
  possible_values: string[]
}
