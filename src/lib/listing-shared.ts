/* The listing rules the server uses, shared with the admin pages so the
   product page shows exactly what the server will decide: the publish
   checklist, highlights from specs, barcode checks and product titles.
   Both files are plain TypeScript with no imports. */

export { checkListing, suggestHighlights, isValidGtin, MIN_HIGHLIGHTS, COLOUR_CATEGORIES } from '../../backend/src/modules/products/listing-rules';
export type { ListingForChecks } from '../../backend/src/modules/products/listing-rules';
export { buildTitle, pickTitleFormat, tidySize, TITLE_FIELDS, DEFAULT_TITLE_FORMATS } from '../../backend/src/modules/products/title-format';
export type { TitleFormatRule, TitleInput } from '../../backend/src/modules/products/title-format';
