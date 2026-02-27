import type { IconDefinition } from '@ant-design/icons-svg/es/types'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import allIconDefs from '@ant-design/icons-svg'
import { isNil, template } from 'es-toolkit/compat'
import { findPackage } from 'pkg-types'

interface IconDefinitionWithIdentifier extends IconDefinition {
  svgIdentifier: string
  svgBase64: string | null
}

const svgPkg = import.meta.resolve('@ant-design/icons-svg')
const svgPkgDir = path.dirname(await findPackage(svgPkg))
const inlineSvgDir = path.join(svgPkgDir, 'inline-namespaced-svg')

async function detectRealPath(icon: IconDefinition) {
  try {
    if ([icon, icon?.theme, icon?.name].some(isNil))
      return null

    const _path = path.join(inlineSvgDir, icon.theme, `${icon.name}.svg`)

    return fs.existsSync(_path) ? _path : null
  }
  catch {
    return null
  }
}

function svg2base64(svgPath: string, size = 50) {
  const svg = fs.readFileSync(svgPath, 'utf-8')
  const svgWithStyle = svg
    .replace(/<svg/, `<svg width="${size}" height="${size}" fill="#cacaca"`)
  // https://github.com/ant-design/ant-design-icons/blob/a02cbf8/packages/icons-svg/templates/helpers.ts#L3-L6
    .replace(/#333/g, '#1677ff')
    .replace(/#E6E6E6/gi, '#e6f4ff')

  // eslint-disable-next-line node/prefer-global/buffer
  const base64 = Buffer.from(svgWithStyle).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

function walk<T>(
  fn: (iconDef: IconDefinitionWithIdentifier) => Promise<T>,
) {
  return Promise.all(
    Object.keys(allIconDefs)
      .map(async (svgIdentifier) => {
        const iconDef = (allIconDefs as { [id: string]: IconDefinition })[
          svgIdentifier
        ]

        const realSvgPath = await detectRealPath(iconDef!)
        let svgBase64 = null
        if (realSvgPath) {
          try {
            svgBase64 = svg2base64(realSvgPath!)
          }
          catch {
            /** nothing */
          }
        }

        return fn(
          {
            svgIdentifier,
            svgBase64,
            ...iconDef,
          } as any,
        )
      }),
  )
}

const templateText = `
// GENERATE BY ./scripts/gen-icons.ts
// DON NOT EDIT IT MANUALLY

import type { AntdIconProps } from '../components/AntdIcon'
import <%= svgIdentifier %>Svg from '@ant-design/icons-svg/es/asn/<%= svgIdentifier %>.js'
import { defineComponent } from 'vue'
import AntdIcon from '../components/AntdIcon'

<% if (svgBase64) { %> /**![<%= name %>](<%= svgBase64 %>) */ <% } %>
const <%= svgIdentifier %> = defineComponent<AntdIconProps>(
  (props) => {
    return () => {
      return <AntdIcon {...props} icon={<%= svgIdentifier %>Svg} />
    }
  },
  {
    name: '<%= svgIdentifier %>',
  },
)

export default <%= svgIdentifier %>
`

async function generateIcons() {
  const baseDir = fileURLToPath(new URL('.', import.meta.url))
  const iconsDir = path.join(baseDir, '../src/icons')
  try {
    await fsp.access(iconsDir)
  }
  catch {
    await fsp.mkdir(iconsDir)
  }
  const render = template(templateText.trim())

  await walk(async (item) => {
    // generate icon file
    await fsp.writeFile(
      path.resolve(baseDir, `../src/icons/${item.svgIdentifier}.tsx`),
      render(item),
    )
  })
  // generate icon index
  const entryText = Object.keys(allIconDefs)
    .sort()
    .map(svgIdentifier => `export { default as ${svgIdentifier} } from './${svgIdentifier}';`)
    .join('\n')
  await fsp.writeFile(path.resolve(baseDir, '../src/icons/index.tsx'), entryText)
}

generateIcons().then(() => {
  console.log('Generate icons successfully.')
})
