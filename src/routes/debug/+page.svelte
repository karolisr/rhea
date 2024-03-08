<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { type UnlistenFn } from '@tauri-apps/api/event'
import { fileDropListener } from '$lib/app/api/filedrop'

import { parse_xml_txt } from '$lib/xml'
import { parse_dtd_txt, parse_dtd_url } from '$lib/xml/dtd'

let cache_dtds = localStorage.getItem('cache-dtds')
let dtds: { [url: string]: string } = cache_dtds ? JSON.parse(cache_dtds) : {}
$: dtdks = dtds ? Object.getOwnPropertyNames(dtds).sort() : []

let cache_gbx_xml_txt = localStorage.getItem('cache-gbx-xml-txt')
let xml_text: string = cache_gbx_xml_txt ? cache_gbx_xml_txt : ''

let fileDropUnListener: UnlistenFn

onMount(async () => {
  // parse_dtd_url('https://www.ncbi.nlm.nih.gov/data_specs/ver/20221005/dtd/NCBI_GBSeq_20221005.dtd')
  // parse_dtd_url('https://www.ncbi.nlm.nih.gov/dtd/NCBI_Organism.dtd')
  // parse_dtd_txt(xml_text)
  // parse_xml_txt(xml_text)
  fileDropUnListener = await fileDropListener()
})

onDestroy(() => {
  fileDropUnListener()
})
</script>

{#each dtdks as k}
  <pre class="m-2 select-all border bg-lime-50 p-2">{k}</pre>
  <!-- <pre class="m-2 select-text border bg-green-50 p-2">{dtds[k]}</pre> -->
  <!-- <pre class="m-2 select-all border bg-lime-50 p-2">{url_parse(k)}</pre> -->
{/each}

<!-- <pre class="m-2 select-text border bg-green-50 p-2">{xml_text}</pre> -->
