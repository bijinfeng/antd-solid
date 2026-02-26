import type { IconDefinition } from '@ant-design/icons-svg/es/types'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import allIconDefs from '@ant-design/icons-svg'
import { isNil, template } from 'es-toolkit/compat'
import { findPackage } from 'pkg-types'

