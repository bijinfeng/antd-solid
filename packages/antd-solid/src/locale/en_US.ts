import type { Locale } from '.';

const typeTemplate = '${label} is not a valid ${type}';

const localeValues: Locale = {
  locale: 'en',
  global: {
    placeholder: 'Please select',
    close: 'Close',
    sortable: 'sortable',
  },
  Icon: {
    icon: 'icon',
  },
  Text: {
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand',
    collapse: 'Collapse',
  },
}

export default localeValues;
